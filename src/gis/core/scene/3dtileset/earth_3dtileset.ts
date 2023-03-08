import { Matrix4 } from "three";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { MatConstants } from "../../../../core/constants/mat_constants";
import { GenericEvent } from "../../../../core/event/generic_event";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { XHRRequestOptions } from "../../../../core/xhr/xhr_request";
import { Earth3DTileContentState, Earth3DTileRefine, Earth3DTilesetGltfUpAxis, Earth3DTilesetOptions, Earth3DTilesetPriority, has3DTilesExtension } from "../../../@types/core/earth_3dtileset";
import { CoordinateOffsetType } from "../../../@types/core/gis";
import { Log } from "../../../log/log";
import { EarthScene } from "../earth_scene";
import { FrameState } from "../frame_state";
import { IPrimitive } from "../primitive";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTilesetCache } from "./earth_3dtileset_cache";
import { Earth3DTilesetMetadata } from "./earth_3dtileset_metadata";
import { Earth3DTilesetStatistics } from "./earth_3dtileset_statistics";
import { Earth3DTilesetTraversal } from "./earth_3dtileset_traversal";
import { PointCloudShading } from "./pointcloud_shading";

enum RootTileLoadState {
    UNLOAD = 1,//未加载
    LOADING,//加载中
    LOADED,//加载完成
    LOADFAILED//加载失败
}


export class Earth3DTileset implements IPrimitive {

    private log: Log = new Log(Earth3DTileset);

    private _id: string;

    private _url: string;

    private _scene?: EarthScene;

    private _show: boolean;

    //坐标偏移类型
    private _coordinateOffsetType: CoordinateOffsetType;

    private _maximumScreenSpaceError: number;

    private _preloadWhenHidden: boolean;

    private _preloadFlightDestinations: boolean;

    //tileset的变换矩阵
    private _modelMatrix: Matrix4;

    //根节点瓦片
    private _root?: Earth3DTile;

    private _rootTileLoadState: RootTileLoadState;

    //当一个3dtile加载完成时 触发该事件
    public tileLoad = new GenericEvent<Earth3DTile>();

    //当一个3dtile加载失败时 触发该事件
    public tileFailed = new GenericEvent<{ message: string, url: string }>();

    //当一个3dtile从缓存中卸载时 触发该事件
    public tileUnload = new GenericEvent<Earth3DTile>();

    //当适配屏幕空间误差的所有3dtile都加载完成时 触发该事件
    public allTilesLoad = new GenericEvent<Earth3DTile>();

    //当root 3dtile加载完成时 此值为true
    private _ready: boolean = false;

    //统计信息
    private _statistics: Earth3DTilesetStatistics;

    //最大使用内存 单位 MB
    private _maximumMemoryUsage: number;

    //准备完毕的Promise
    private _readyPromise: Promise<boolean>;

    private _readyPromise_resolve: Function | undefined;

    private _readyPromise_reject: Function | undefined;

    //元数据
    private _metadata?: Earth3DTilesetMetadata;

    //tileset 版本
    private _tilesetVersion?: string;

    //发送 3dtile请求时的 请求配置
    private _assetLoadParams: XHRRequestOptions;

    public get assetLoadParams () {
        return this._assetLoadParams;
    }

    //gltf up axis
    private _gltfUpAxis?: Earth3DTilesetGltfUpAxis;

    private _pointCloudShading: PointCloudShading;

    //是否合并网格
    private _mergeMesh: boolean;

    //标识  是否root下的所有tile都是add类型
    private _allTilesAdditive: boolean = true;

    //0-0.5之间的值
    private _progressiveResolutionHeightFraction: number;

    //优化选择 确定遍历期间是否跳过细节选择
    private _skipLevelOfDetail: boolean;

    //标识 是否禁止遍历期间跳过细节选择
    private _disableSkipLevelOfDetail: boolean = false;

    //是否优先加载叶子节点
    private _preferLeaves: boolean;

    //最大优先级
    private _maximumPriority: Earth3DTilesetPriority;

    //最小优先级
    private _minimumPriority: Earth3DTilesetPriority;

    private _foveatedScreenSpaceError: boolean;

    private _foveatedConeSize: number;

    private _foveatedMinimumScreenSpaceErrorRelaxation: number;

    private _foveatedInterpolationCallback: Function;

    private _hasMixedContent: boolean = false;

    //When true, only tiles that meet the maximum screen space error will ever be downloaded.
    //Skipping factors are ignored and just the desired tiles are loaded.
    private _immediatelyLoadDesiredLevelOfDetail: boolean;

    /**
     * Determines whether siblings of visible tiles are always downloaded during traversal.
     * This may be useful for ensuring that tiles are already available when the viewer turns left/right.
     */
    private _loadSiblings: boolean;

    //更新可见性的帧索引
    private _updatedVisibilityFrame: number = 0;

    /**
     * Multiplier defining the minimum screen space error to skip.
     * For example, if a tile has screen space error of 100, no tiles will be loaded unless they
     * are leaves or have a screen space error
     */
    private _skipScreenSpaceErrorFactor: number;

    /**
     * Constant defining the minimum number of levels to skip when loading tiles. When it is 0, no levels are skipped.
     * For example, if a tile is level 1, no tiles will be loaded unless they are at level greater than 2.
     */
    private _skipLevels: number;

    /**
     * The screen space error that must be reached before skipping levels of detail.
     */
    private _baseScreenSpaceError: number;

    private _updatedModelMatrixFrame: number = 0;

    private _previousModelMatrix: Matrix4 = new Matrix4();

    private _modelMatrixChanged: boolean = false;

    //tileset.json中的asset
    private _asset: any;

    //tileset.json中的properties
    private _properties: any;

    //tileset.json中的geometricError
    private _geometricError: number | undefined;

    //tileset.json中的extensionsUsed
    private _extensionsUsed: any;

    //tileset.json中的extensions
    private _extensions: any;

    private _requestedTiles: Earth3DTile[] = [];

    //上一帧选中的3dtile
    private _previousSelectedTiles: Earth3DTile[] = [];

    private _selectedTiles: Earth3DTile[] = [];

    private _selectedTilesToStyle: Earth3DTile[] = [];

    private _requestedTilesInFlight: Earth3DTile[] = [];

    private _emptyTiles: Earth3DTile[] = [];

    private _cache: Earth3DTilesetCache = new Earth3DTilesetCache();

    //遍历对象
    private _traversal: Earth3DTilesetTraversal = new Earth3DTilesetTraversal();

    public get baseScreenSpaceError () {
        return this._baseScreenSpaceError;
    }

    public get cache () {
        return this._cache;
    }

    public get loadSiblings () {
        return this._loadSiblings;
    }

    public set loadSiblings (loadSiblings: boolean) {
        this._loadSiblings = loadSiblings;
    }

    public get immediatelyLoadDesiredLevelOfDetail () {
        return this._immediatelyLoadDesiredLevelOfDetail;
    }

    public get previousSelectedTiles () {
        return this._previousSelectedTiles;
    }

    public set previousSelectedTiles (previousSelectedTiles: Earth3DTile[]) {
        this._previousSelectedTiles = previousSelectedTiles;
    }

    public get statistics () {
        return this._statistics;
    }

    public get totalMemoryUsageInBytes () {
        let statistics = this._statistics;
        return (statistics.texturesByteLength + statistics.geometryByteLength + statistics.batchTableByteLength);
    }

    public get memoryOutRange () {
        return this.totalMemoryUsageInBytes > this.maximumMemoryUsage * 1024 * 1024;
    }

    public get maximumMemoryUsage () {
        return this._maximumMemoryUsage;
    }

    public set maximumMemoryUsage (val: number) {
        this._maximumMemoryUsage = val;
    }

    public get selectedTiles () {
        return this._selectedTiles;
    }

    public get requestedTiles () {
        return this._requestedTiles;
    }

    public get selectedTilesToStyle () {
        return this._selectedTilesToStyle;
    }

    public get emptyTiles () {
        return this._emptyTiles;
    }

    public get foveatedScreenSpaceError () {
        return this._foveatedScreenSpaceError;
    }

    public get foveatedInterpolationCallback () {
        return this._foveatedInterpolationCallback;
    }

    public get foveatedMinimumScreenSpaceErrorRelaxation () {
        return this._foveatedMinimumScreenSpaceErrorRelaxation;
    }

    public get foveatedConeSize () {
        return this._foveatedConeSize;
    }

    public get maximumPriority () {
        return this._maximumPriority;
    }

    public get minimumPriority () {
        return this._minimumPriority;
    }

    public get skipLevelOfDetail () {
        return this._skipLevelOfDetail;
    }

    public get disableSkipLevelOfDetail () {
        return this._disableSkipLevelOfDetail;
    }

    public set disableSkipLevelOfDetail (disableSkipLevelOfDetail: boolean) {
        this._disableSkipLevelOfDetail = disableSkipLevelOfDetail;
    }

    public get skipScreenSpaceErrorFactor () {
        return this._skipScreenSpaceErrorFactor;
    }

    public get skipLevels () {
        return this._skipLevels;
    }

    public get asset () {
        return this._asset;
    }

    public get extensions () {
        return this._extensions;
    }

    public get properties () {
        return this._properties;
    }

    public get coordinateOffsetType () {
        return this._coordinateOffsetType;
    }

    public get id () {
        return this._id;
    }

    public get url () {
        return this._url;
    }

    public get scene () {
        return this._scene;
    }

    public get tilingScheme () {
        return this.scene!.tilingScheme;
    }

    public get ready () {
        return this._ready;
    }

    public get readyPromise () {
        return this._readyPromise;
    }

    public get root () {
        return this._root!;
    }

    public get preferLeaves () {
        return this._preferLeaves;
    }

    public get show () {
        return this._show;
    }

    public set show (val: boolean) {
        this._show = val;
    }

    public get mergeMesh () {
        return this._mergeMesh;
    }

    public get pointCloudShading () {
        return this._pointCloudShading;
    }

    public get modelMatrix () {
        return this._modelMatrix;
    }

    public set modelMatrix (mat: Matrix4) {
        this._modelMatrix = mat.clone();
    }

    public get maximumScreenSpaceError () {
        return this._maximumScreenSpaceError;
    }

    public get preloadWhenHidden () {
        return this._preloadWhenHidden;
    }

    public get preloadFlightDestinations () {
        return this._preloadFlightDestinations;
    }

    public get metadata () {
        return this._metadata;
    }

    public get gltfUpAxis () {
        return this._gltfUpAxis!;
    }

    public get geometricError () {
        return this._geometricError!;
    }

    public get progressiveResolutionHeightFraction () {
        return this._progressiveResolutionHeightFraction;
    }

    public get boundingSphere () {
        if (this._ready) {
            this._root!.updateTransform(this._modelMatrix);
            return this._root!.boundingSphere;
        }
    }

    public get hasMixedContent () {
        return this._hasMixedContent;
    }

    public set hasMixedContent (hasMixedContent: boolean) {
        this._hasMixedContent = hasMixedContent;
    }

    public get updatedVisibilityFrame () {
        return this._updatedVisibilityFrame;
    }

    public set updatedVisibilityFrame (updatedVisibilityFrame: number) {
        this._updatedVisibilityFrame = updatedVisibilityFrame;
    }

    constructor (options: Earth3DTilesetOptions) {
        this._id = Utils.createGuid();
        this._url = options.url;
        this._coordinateOffsetType = Utils.defaultValue(options.coordinateOffsetType, CoordinateOffsetType.NONE);
        this._show = Utils.defaultValue(options.show, true);
        this._statistics = new Earth3DTilesetStatistics();
        this._maximumMemoryUsage = Utils.defaultValue(options.maximumMemoryUsage, 1024);
        this._mergeMesh = Utils.defaultValue(options.mergeMesh, false);
        this._modelMatrix = Utils.defaultValue(options.modelMatrix, new Matrix4());
        this._maximumScreenSpaceError = Utils.defaultValue(options.maximumScreenSpaceError, 512);
        this._preloadFlightDestinations = Utils.defaultValue(options.preloadFlightDestinations, true);
        this._preloadWhenHidden = Utils.defaultValue(options.preloadWhenHidden, false);
        this._progressiveResolutionHeightFraction = Utils.defaultValue(options.progressiveResolutionHeightFraction, 0.3);
        this._skipLevelOfDetail = Utils.defaultValue(options.skipLevelOfDetail, false);
        this._preferLeaves = Utils.defaultValue(options.preferLeaves, false);
        this._rootTileLoadState = RootTileLoadState.UNLOAD;
        this._readyPromise = this.createReadyPromise();
        this._assetLoadParams = Object.assign({}, options.assetLoadParams, {
            url: this._url
        });
        this._maximumPriority = {
            foveatedFactor: -Number.MAX_VALUE,
            depth: -Number.MAX_VALUE,
            distance: -Number.MAX_VALUE,
            reverseScreenSpaceError: -Number.MAX_VALUE
        };
        this._minimumPriority = {
            foveatedFactor: Number.MAX_VALUE,
            depth: Number.MAX_VALUE,
            distance: Number.MAX_VALUE,
            reverseScreenSpaceError: Number.MAX_VALUE
        }
        this._foveatedScreenSpaceError = Utils.defaultValue(options.foveatedScreenSpaceError, true);
        this._foveatedConeSize = Utils.defaultValue(options.foveatedConeSize, 0.1);
        this._foveatedMinimumScreenSpaceErrorRelaxation = Utils.defaultValue(options.foveatedMinimumScreenSpaceErrorRelaxation, 0.0);
        this._foveatedInterpolationCallback = Utils.defaultValue(options.foveatedInterpolationCallback, math.lerp);
        this._immediatelyLoadDesiredLevelOfDetail = Utils.defaultValue(options.immediatelyLoadDesiredLevelOfDetail, false);
        this._loadSiblings = Utils.defaultValue(options.loadSiblings, false);
        this._skipScreenSpaceErrorFactor = Utils.defaultValue(options.skipScreenSpaceErrorFactor, 16);
        this._skipLevels = Utils.defaultValue(options.skipLevels, 1);
        this._baseScreenSpaceError = Utils.defaultValue(options.baseScreenSpaceError, 1024);
        this._pointCloudShading = options.pointCloudShading;
    }

    /**
   * 创建 准备完毕的promise
   */
    private createReadyPromise () {
        return new Promise<boolean>((resolve, reject) => {
            this._readyPromise_resolve = resolve;
            this._readyPromise_reject = reject;
        })
    }

    /**
   * 调用 readyPromise
   */
    private callReadyPromise (state: boolean) {
        if (state) {
            this._readyPromise_resolve!(state);
        } else {
            this._readyPromise_reject!(state);
        }
    }

    public render (scene: EarthScene, frameState: FrameState) {
        if (!Utils.defined(this._scene)) {
            this._scene = scene;
        }
        //先加载根节点
        if (this._rootTileLoadState === RootTileLoadState.UNLOAD) {
            this._rootTileLoadState = RootTileLoadState.LOADING;
            this.loadJson().then((res: any) => {
                this.processMetadataExtension(res).then(() => {
                    this.readTilesetJson(res);
                    this._rootTileLoadState = RootTileLoadState.LOADED;
                    this._ready = true;
                    this.callReadyPromise(true);
                }).catch(error => {
                    let msg = `process 3dtileset(${this._url}) metadata failed: ${error}`;
                    this.log.error(msg, error);
                    this._rootTileLoadState = RootTileLoadState.LOADFAILED;
                });
            }).catch(err => {
                let msg = `load 3dtileset(${this._url}) failed: ${err}`;
                this.log.error(msg);
                this._rootTileLoadState = RootTileLoadState.LOADFAILED;
            });
        }

        //根节点加载完成
        if (this._rootTileLoadState === RootTileLoadState.LOADED) {
            this.update(this, frameState);
        }
    }

    /**
     * 读取tileset.json
     * @param tilesetJson 
     */
    private readTilesetJson (tilesetJson: any) {
        //读取 gltf up axis
        if (Utils.defined(tilesetJson.asset) && Utils.defined(tilesetJson.asset.gltfUpAxis)) {
            let axisName = tilesetJson.asset.gltfUpAxis.toUpperCase();
            if (axisName === "X") this._gltfUpAxis = Earth3DTilesetGltfUpAxis.X;
            else if (axisName === "Y") this._gltfUpAxis = Earth3DTilesetGltfUpAxis.Y;
            else this._gltfUpAxis = Earth3DTilesetGltfUpAxis.Z;
        } else {
            this._gltfUpAxis = Earth3DTilesetGltfUpAxis.Y;
        }
        this._asset = tilesetJson.asset;
        this._properties = tilesetJson.properties;
        this._geometricError = Number(tilesetJson.geometricError);
        this._extensionsUsed = tilesetJson.extensionsUsed;
        this._extensions = tilesetJson.extensions;

        this._root = this.loadTileset(tilesetJson);
        let boundingVolume = this._root.createBoundingVolume(tilesetJson.root.boundingVolume, MatConstants.Mat4_IDENTITY);
        //TODO 处理3dtile与地形的关系

    }

    /**
     * 加载tileset
     */
    public loadTileset (json: any, parentTile?: Earth3DTile) {
        let asset = json.asset;
        if (!Utils.defined(asset)) {
            this.log.error("Tileset must have an asset property.");
            return;
        }
        if (asset.version !== "0.0" && asset.version !== "1.0") {
            this.log.error("The tileset must be 3D Tiles version 0.0 or 1.0.");
            return;
        }
        let tilesetVersion = asset.tilesetVersion;
        if (Utils.defined(tilesetVersion)) {
            this._tilesetVersion = tilesetVersion;
            //将 tilesetVersion 参数 加入到请求参数中
            if (!Utils.defined(this._assetLoadParams.params)) {
                this._assetLoadParams.params = {
                    v: this._tilesetVersion
                };
            }
        }
        let rootTile = this.makeTile(json.root, parentTile, Utils.getAbsouteUri(Utils.defined(parentTile) ? parentTile!.tilesetRecourceUri || "" : this._assetLoadParams.url, Utils.defined(parentTile) ? parentTile!.resourceUri || "" : ""));
        if (Utils.defined(parentTile)) {
            parentTile!.children.push(rootTile);
            rootTile.depth = parentTile!.depth + 1;
        }

        let stack = [];
        stack.push(rootTile);

        //遍历root下的所有子节点
        while (stack.length) {
            let tile = stack.pop()!;
            ++this.statistics.numberOfTilesTotal;
            this._allTilesAdditive = this._allTilesAdditive && tile.refine === Earth3DTileRefine.ADD;
            let children = tile.header.children;
            if (Utils.defined(children)) {
                for (let i = 0; i < children.length; i++) {
                    const childHeader = children[i];
                    let childTile = this.makeTile(childHeader, tile, rootTile.tilesetRecourceUri);
                    childTile.depth = tile.depth + 1;
                    tile.children.push(childTile);
                    stack.push(childTile);
                }
            }
        }

        return rootTile;
    }

    /**
     * 创建tile
     */
    private makeTile (jsonHeader: any, parentTile: Earth3DTile | undefined, tilesetResourceUri?: string) {
        //TODO 根据扩展创建tile
        if (has3DTilesExtension(jsonHeader, "3DTILES_implicit_tiling")) {
        }
        return new Earth3DTile({
            tileset: this,
            baseUrl: this.url,
            header: jsonHeader,
            parent: parentTile,
            tilesetResourceUri: tilesetResourceUri
        });
    }

    /**
     * 处理3dtileset 扩展
     * @param json 
     */
    private processMetadataExtension (json: any) {
        //TODO 处理3dtile扩展
        return new Promise<Earth3DTilesetMetadata>((resolve, reject) => {
            if (has3DTilesExtension(json, "3DTILES_metadata")) {
                let extensions = json.extensions["3DTILES_metadata"];
                this._metadata = new Earth3DTilesetMetadata(this);
                resolve(this._metadata);
            } else {
                this._metadata = new Earth3DTilesetMetadata(this);
                resolve(this._metadata);
            }
        });
    }


    /**
     * 加载tileset.json
     */
    private loadJson () {
        return new Promise<any>((resolve, reject) => {
            AssetLoader.loadJSON(this._assetLoadParams).then(res => {
                resolve(true);
            }).catch(reject);
        });
    }

    /**
     * 重设最大最小值
     * @param tileset 
     */
    private resetMinimumMaximum (tileset: Earth3DTileset) {
        tileset.minimumPriority.depth = Number.MAX_VALUE;
        tileset.maximumPriority.depth = -Number.MAX_VALUE;
        tileset.minimumPriority.foveatedFactor = Number.MAX_VALUE;
        tileset.maximumPriority.foveatedFactor = -Number.MAX_VALUE;
        tileset.minimumPriority.distance = Number.MAX_VALUE;
        tileset.maximumPriority.distance = -Number.MAX_VALUE;
        tileset.minimumPriority.reverseScreenSpaceError = Number.MAX_VALUE;
        tileset.maximumPriority.reverseScreenSpaceError = -Number.MAX_VALUE;
    }

    /**
     * 检测模型矩阵是否改变
     * @param tileset 
     * @param frameState 
     */
    private detectModelMatrixChanged (tileset: Earth3DTileset, frameState: FrameState) {
        if (
            frameState.frameNumber !== tileset._updatedModelMatrixFrame ||
            !Utils.defined(tileset._previousModelMatrix)
        ) {
            tileset._updatedModelMatrixFrame = frameState.frameNumber;
            tileset._modelMatrixChanged = !tileset.modelMatrix.equals(tileset._previousModelMatrix);
            if (tileset._modelMatrixChanged) {
                tileset._previousModelMatrix = tileset.modelMatrix.clone();
            }
        }
    }

    /**
     * 请求瓦片
     * @param tileset 
     */
    private executeRequestTiles (tileset: Earth3DTileset) {
        let requestTiles = this.requestedTiles;
        //requestSchduler中会排序
        // this.requestedTiles.sort((a: Earth3DTile, b: Earth3DTile) => a.priority - b.priority);
        for (let i = 0; i < requestTiles.length; i++) {
            const tile = requestTiles[i];
            this.executeRequestContent(tileset, tile);
        }
    }

    /**
     * 请求瓦片内容
     * @param tilset 
     * @param tile 
     */
    private executeRequestContent (tileset: Earth3DTileset, tile: Earth3DTile) {
        if (tile.hasEmptyContent) {
            return;
        }
        tile.contentReadyPromise.then(() => {
            if (!tile.hasTilesetContent && !tile.hasImplicitContent) {
                tileset.statistics.incrementLoadCounts(tile.content!);
                ++tileset.statistics.numberOfTilesWithContentReady;
                ++tileset.statistics.numberOfLoadedTilesTotal;
                tileset.cache.add(tile);
            }
            tileset.tileLoad.emit(tile);
        }).catch(err => {
            let url = tile.header.content.uri || tile.header.content.url;
            tileset.tileFailed.emit({
                message: err,
                url: url
            });
            this.log.error("A 3D tile failed to load: " + url, err);
        });

        tile.requestContent();

        tileset._requestedTilesInFlight.push(tile);

    }

    /**
     * 取消部分请求
     * @param frameState 
     */
    private cancelOutOfViewRequests (tileset: Earth3DTileset, frameState: FrameState) {
        let requestedTilesInFlight = tileset._requestedTilesInFlight;
        let removeCount = 0;
        let length = requestedTilesInFlight.length;
        for (let i = 0; i < length; ++i) {
            let tile = requestedTilesInFlight[i];

            // NOTE: This is framerate dependant so make sure the threshold check is small
            let outOfView = frameState.frameNumber - tile.touchedFrame >= 1;
            if (tile.contentState !== Earth3DTileContentState.LOADING) {
                ++removeCount;
                continue;
            } else if (outOfView) {
                tile.cancelRequest();
                ++removeCount;
                continue;
            }

            if (removeCount > 0) {
                requestedTilesInFlight[i - removeCount] = tile;
            }
        }
        requestedTilesInFlight.length -= removeCount;
    }

    /**
     * 执行更新瓦片
     * @param tileset 
     * @param frameState 
     */
    private executeUpdateTiles (tileset: Earth3DTileset, frameState: FrameState) {
        if (tileset._modelMatrixChanged) {
            for (let i = 0; i < this.selectedTiles.length; i++) {
                const tile = this.selectedTiles[i];
                tile.update(tileset, frameState);
            }
            for (let i = 0; i < this.emptyTiles.length; i++) {
                const eTile = this.emptyTiles[i];
                eTile.update(tileset, frameState);
            }
        }
    }

    private showSelectedTiles () {
        let selectIds = this.selectedTiles.map(tile => tile.id);
        for (let i = 0; i < this.previousSelectedTiles.length; i++) {
            const previousTile = this.previousSelectedTiles[i];
            if (selectIds.indexOf(previousTile.id) === -1) {
                previousTile.hideContent(this);
            }
        }
        for (let i = 0; i < this.selectedTiles.length; i++) {
            const selectTile = this.selectedTiles[i];
            this.statistics.incrementSelectionCounts(selectTile.content!);
            ++this.statistics.selected;
            selectTile.showContent(this);

        }
    }

    /**
     * 卸载tile
     * @param tileset 
     * @param tile 
     */
    private unloadTile (tileset: Earth3DTileset, tile: Earth3DTile) {
        tileset.tileUnload.emit(tile);
        if (Utils.defined(tile.content)) {
            tileset.statistics.decrementLoadCounts(tile.content!);
            --tileset.statistics.numberOfTilesWithContentReady;
        }
        tile.unloadContent();
    }

    private update (tileset: Earth3DTileset, frameState: FrameState) {
        if (!tileset.ready) {
            return;
        }

        this.statistics.clear();

        this._skipLevelOfDetail = this.skipLevelOfDetail && !this._disableSkipLevelOfDetail && !this._allTilesAdditive;

        this._cache.trim();
        if (frameState.cameraChanged) {
            this._cache.reset();
        }

        tileset.updatedVisibilityFrame = tileset.updatedVisibilityFrame + 1;
        this.resetMinimumMaximum(this);
        this.detectModelMatrixChanged(this, frameState);
        this._traversal.selectTiles(this, frameState);
        this.executeRequestTiles(tileset);
        this.executeUpdateTiles(tileset, frameState);

        this._cache.unloadTiles(this, this.unloadTile);
        this.cancelOutOfViewRequests(this, frameState);
        this.showSelectedTiles();

    }


    public destroy () {

    }

}