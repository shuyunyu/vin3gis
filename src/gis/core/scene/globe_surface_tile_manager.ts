import { math } from "../../../core/math/math";
import { Utils } from "../../../core/utils/utils";
import { Cartesian3 } from "../cartesian/cartesian3";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { Transform } from "../transform/transform";
import { EarthScene } from "./earth_scene";
import { FrameState } from "./frame_state";
import { GlobeSurfaceTile } from "./globe_surface_tile";
import { QuadtreePrimitive } from "./quad_tree_primitive";
import { QuadtreeTile } from "./quad_tree_tile";
import { QuadtreeTileQueue } from "./quad_tree_tile_queue";

const tileDirectionScratch = new Cartesian3();

export class GlobeSurfaceTileManager {

    private _quadtreePrimitive: QuadtreePrimitive;

    private _scene: EarthScene;

    private _terrainProvider: ITerrainProvider;

    /**
     * 需要进行遍历的四叉树的队列
     */
    private _traversalQueue: QuadtreeTileQueue = new QuadtreeTileQueue();

    /**
     * 高优先级的瓦片下载队列
     */
    private _tileLoadQueueHigh: QuadtreeTile[] = [];

    /**
     * 中优先级的瓦片下载队列
     */
    private _tileLoadQueueMedium: QuadtreeTile[] = [];


    /**
     * 需要渲染的瓦片队列
     */
    private _tileRenderQueue: QuadtreeTile[] = [];

    /**
     * 上一帧需要渲染的瓦片队列
     */
    private _beforeFrameTileRenderQueue: QuadtreeTileQueue = new QuadtreeTileQueue();

    private _loadQueueTimeSlice: number = 5;

    //当前帧选中的瓦片数量
    private _curFrameSelectTileCount: number;

    public get curFrameSelectTIleCount () {
        return this._curFrameSelectTileCount;
    }

    constructor (quadtreePrimitive: QuadtreePrimitive, terrainProvider: ITerrainProvider, scene: EarthScene) {
        this._quadtreePrimitive = quadtreePrimitive;
        this._terrainProvider = terrainProvider;
        this._scene = scene;
    }

    public render (delay: number, frameState: FrameState) {
        this._quadtreePrimitive.tileReplacementQueue.markStartOfRenderFrame();
        //检查根节点瓦片是否创建
        if (!Utils.defined(this._quadtreePrimitive.levelZeroTiles)) {
            //没有根节点瓦片就创建它
            if (this._quadtreePrimitive.tileProvider.ready) {
                let tilingScheme = this._quadtreePrimitive.tileProvider.tilingScheme;
                let levelZeroTiles = QuadtreeTile.createLevelZeroTiles(tilingScheme);
                this._quadtreePrimitive.levelZeroTiles = levelZeroTiles;
                //放入下载队列进行下载
                for (let i = 0; i < levelZeroTiles.length; i++) {
                    const tile = levelZeroTiles[i];
                    tile.updateDistanceToCamera(frameState);
                    this.addTileToLoadQueue(tile, this._tileLoadQueueHigh);
                    this._quadtreePrimitive.tileReplacementQueue.markTileRendered(tile);
                }
            }
        } else {//已经创建 
            for (let i = 0; i < this._quadtreePrimitive.levelZeroTiles!.length; i++) {
                const rootTile = this._quadtreePrimitive.levelZeroTiles![i];
                this._quadtreePrimitive.tileReplacementQueue.markTileRendered(rootTile);
                //如果可以渲染 并且可见  将其加入 遍历队列
                // if (rootTile.canRender(this._scene.imageryProviders)) {
                //     this._traversalQueue.enqueue(rootTile);
                // }
                if (rootTile.renderable && this._quadtreePrimitive.tileProvider.computeTileVisibility(rootTile, frameState.frustum)) {
                    this._traversalQueue.enqueue(rootTile);
                }
            }
        }
        this.selectTilesToRender(frameState);
        this._quadtreePrimitive.tileReplacementQueue.trimTiles(this._quadtreePrimitive.tileCacheSize);
        this.processTileDownloadQueue(frameState);
        this.renderTiles(frameState);
    }

    /**
     * 处理下载队列
     * @param frameState 
     * @returns 
     */
    private processTileDownloadQueue (frameState: FrameState) {
        if (this._tileLoadQueueHigh.length === 0 && this._tileLoadQueueMedium.length === 0) {
            return;
        }
        let endTime = this.getTimestamp() + this._loadQueueTimeSlice;
        let didSomeLoading = this.processSingleTileDownloadQueue(frameState, endTime, this._tileLoadQueueHigh, false);
        this.processSingleTileDownloadQueue(frameState, endTime, this._tileLoadQueueMedium, didSomeLoading);
        this._tileLoadQueueMedium.length = 0;
        this._tileLoadQueueHigh.length = 0;
    }

    /**
     * 处理单个下载队列
     * @returns 
     */
    private processSingleTileDownloadQueue (frameState: FrameState, endTime: number, queue: QuadtreeTile[], didSomeLoading: boolean) {
        for (let i = 0; i < queue.length; i++) {
            const quadtreeTile = queue[i];
            GlobeSurfaceTile.initialize(quadtreeTile, this._terrainProvider, this._scene.imageryProviderRenderManager, this._scene.tileNodeRenderer);
            quadtreeTile.priority = this.computeTileLoadPriority(quadtreeTile, frameState);
        }
        //保证 当前帧需要下载的瓦片优先级最高
        queue.sort((tile1: QuadtreeTile, tile2: QuadtreeTile) => tile1.priority - tile2.priority);
        for (let i = 0; i < queue.length && (this.getTimestamp() < endTime || !didSomeLoading); i++) {
            const tile = queue[i];
            tile.data.processStateMachine();
            didSomeLoading = true;
        }
        return didSomeLoading;
    }

    private getTimestamp () {
        return (performance || Date).now();
    }

    /**
     * 选择渲染瓦片
     */
    private selectTilesToRender (frameState: FrameState) {
        let tile: QuadtreeTile;
        while (tile = this._traversalQueue.dequeue()) {
            GlobeSurfaceTile.initialize(tile, this._terrainProvider, this._scene.imageryProviderRenderManager, this._scene.tileNodeRenderer);
            //摄像机到屏幕中心的距离 小于 摄像机到瓦片的距离  说明瓦片精度更高 可以直接渲染
            tile.updateDistanceToCamera(frameState);
            //满足sse 并且满足最小缩放等级
            if (Transform.validateSpaceError(tile, this._quadtreePrimitive.tileProvider, frameState) && tile.level >= this._quadtreePrimitive.minimumLevel) {
                this.addTileToRenderQueue(tile);
                this._quadtreePrimitive.tileReplacementQueue.markTileRendered(tile);
            } else if (this.queueChildrenLoadAndDetermineIfChildrenAreAllRenderable(tile, frameState)) {
                let children = tile.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (this._quadtreePrimitive.tileProvider.computeTileVisibility(child, frameState.frustum)) {
                        this._traversalQueue.enqueue(child);
                    }
                }
            } else {//精度不够 凑合先用
                this.addTileToRenderQueue(tile);
                this._quadtreePrimitive.tileReplacementQueue.markTileRendered(tile!);
            }
        }
    }

    /**
     * 将瓦片添加至渲染队列
     * @param quadtreeTile 
     */
    private addTileToRenderQueue (quadtreeTile: QuadtreeTile) {
        this._tileRenderQueue.push(quadtreeTile);
    }

    /**
     * 将瓦片添加至下载队列
     */
    private addTileToLoadQueue (quadtreeTile: QuadtreeTile, queue: QuadtreeTile[]) {
        queue.push(quadtreeTile);
    }

    /**
     * 遍历四叉树子节点  验证它们是否都是可以渲染了
     */
    private queueChildrenLoadAndDetermineIfChildrenAreAllRenderable (quadtreeTile: QuadtreeTile, frameState: FrameState) {
        let count = 0;
        let children = quadtreeTile.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this._quadtreePrimitive.tileReplacementQueue.markTileRendered(child);
            if (child.renderable) {
                count++;
            }
            if (child.needsLoading) {
                child.updateDistanceToCamera(frameState);
                let meetsSse = Transform.validateSpaceError(child, this._quadtreePrimitive.tileProvider, frameState);
                if (meetsSse) {
                    this.addTileToLoadQueue(child, this._tileLoadQueueHigh);
                } else {
                    this.addTileToLoadQueue(child, this._tileLoadQueueMedium);
                }
            }
        }
        return count === children.length;
    }

    /**
     * 计算瓦片加载的优先级
     */
    private computeTileLoadPriority (tile: QuadtreeTile, framteState: FrameState) {
        let surfaceTile = tile.data;
        if (!Utils.defined(surfaceTile)) {
            return 0.0;
        }
        let cameraPosition = framteState.cameraPositionWC;
        let cameraDirection = framteState.cameraDirectionWC;
        let tileDirection = Cartesian3.subtract(tileDirectionScratch, tile.rectangle.center, cameraPosition);
        let magnitude = Cartesian3.len(tileDirection);
        if (magnitude < math.EPSILON5) {
            return 0.0;
        }
        Cartesian3.multiplyScalar(tileDirection, tileDirection, 1 / magnitude);
        return (
            (1.0 - Cartesian3.dot(tileDirection, cameraDirection)) * tile.distanceToCamera!
        );
    }

    /**
     * 渲染瓦片
     */
    private renderTiles (frameState: FrameState) {
        this._curFrameSelectTileCount = this._tileRenderQueue.length;
        const unrenderTiles = this._beforeFrameTileRenderQueue.difference(this._tileRenderQueue);
        //取消已经渲染但是当前帧不需要渲染的瓦片
        unrenderTiles.forEach(tile => {
            this._scene.tileNodeRenderer.unrender(tile);
            tile.data?.markToUnrender();
        });
        //copy tile render queue
        this._beforeFrameTileRenderQueue.copy(this._tileRenderQueue);
        this._tileRenderQueue.forEach(tile => {
            tile.data.rendererTileImagerys();
        })
        // this._scene.imageryProviders.foreach((provider: IImageryTileProvider, index: number) => {
        //     if (provider.visible) this.renderImageryTileProviderTiles(provider, this._tileRenderQueue, frameState);
        //     else {
        //         //TODO handle provider visible
        //     }
        // })
        this._tileRenderQueue.length = 0;
    }

    /**
     * 渲染瓦片提供者的瓦片贴图
     */
    private renderImageryTileProviderTiles (imageryProvider: IImageryTileProvider, toRenderQueue: QuadtreeTile[], frameState: FrameState) {
        // let tileRenderedQueue = this._scene.imageryProviderRenderManager.getProviderRenderQueue(imageryProvider);
        // let selectedToRenderdQueue = [].concat(toRenderQueue) as QuadtreeTile[];

        // let stack: QuadtreeTile[] = selectedToRenderdQueue.filter(tile => tile.level < imageryProvider.minimumLevel);
        // //当小于最小缩放等级时  用最邻近的缩放等级替代
        // while (stack.length > 0) {
        //     const tile = stack.pop()!;
        //     for (let i = 0; i < tile.children.length; i++) {
        //         const child = tile.children[i];
        //         if (imageryProvider.computeTileVisibility(child, frameState.frustum)) {
        //             if (child.level >= imageryProvider.minimumLevel) {
        //                 //如果没有数据  说明此瓦片没有被加载
        //                 if (!child.data) {
        //                     GlobeSurfaceTile.initialize(child, this._terrainProvider, this._scene.imageryProviderRenderManager, this._scene.tileNodeRenderer);
        //                 }
        //                 child.data!.processStateMachine();
        //                 selectedToRenderdQueue.push(child);
        //             } else {
        //                 stack.push(child);
        //             }
        //         }
        //     }
        // }

        // stack = selectedToRenderdQueue.filter(tile => tile.level > imageryProvider.maximumLevel);
        // //当超过最缩放等级时  用满足缩放等级的父级替换
        // while (stack.length > 0) {
        //     let tile = stack.pop();
        //     let ancestor = tile.parent;
        //     while (Utils.defined(ancestor) && ancestor.level > imageryProvider.maximumLevel) {
        //         ancestor = ancestor.parent;
        //     }
        //     if (Utils.defined(ancestor) && selectedToRenderdQueue.indexOf(ancestor!) === -1) {
        //         selectedToRenderdQueue.push(ancestor);
        //     }
        // }
        // for (let i = 0; i < selectedToRenderdQueue.length; i++) {
        //     let tile = selectedToRenderdQueue[i];
        //     tile.data.rendererTileImagerys(imageryProvider);
        // }
        // let toRecyleTiles = tileRenderedQueue.difference(selectedToRenderdQueue);
        // for (let i = 0; i < toRecyleTiles.length; i++) {
        //     const recyleTile = toRecyleTiles[i];
        //     tileRenderedQueue.remove(recyleTile);
        //     //此处 GlobeSurfaceTile有可能已经被释放掉了(超出了QuadtreePrimitive的缓存数量)
        //     recyleTile.data?.recyleTileImagery(imageryProvider);

        // }
        // selectedToRenderdQueue.length = 0;
        // toRecyleTiles.length = 0;
    }

}