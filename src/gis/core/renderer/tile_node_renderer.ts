import { Object3D } from "three";
import { TWEEN } from "../../../core/tween/Index";
import { ImageryTileRenderParam } from "../../@types/core/gis";
import { InternalConfig } from "../internal/internal_config";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { TileNode } from "./tile_node";

/**
 * 瓦片节点渲染器
 */
export class TileNodeRenderer {

    //渲染器根节点
    public readonly root = new Object3D();

    private _tileNodeRecord: Record<string, TileNode> = Object.create(null);

    private _renderTileNodeCount = 0;

    //当前渲染瓦片节点数量
    public get renderTileNodeCount () {
        return this._renderTileNodeCount;
    }

    //当前正在fadeout的瓦片节点
    private _fadeoutTiles: string[] = [];

    public constructor () { }

    /**
     * 渲染瓦片贴图
     * @param baseImagery 底层瓦片贴图
     * @param overlayImagery 上层瓦片贴图
     */
    public render (tile: QuadtreeTile, baseImagery?: ImageryTileRenderParam, overlayImagery?: ImageryTileRenderParam) {
        this.unrender(tile);
        //必须有一个才渲染
        if (!baseImagery && !overlayImagery) return;
        let tileNode = new TileNode(tile.id);
        this._tileNodeRecord[tile.id] = tileNode;
        const mesh = tileNode.createTileMesh(tile, baseImagery, overlayImagery);
        mesh.renderOrder = 0;
        this.root.add(mesh);
        this._renderTileNodeCount++;
    }

    /**
     * 取消瓦片贴图的渲染
     * @param tile 
     */
    public unrender (tile: QuadtreeTile) {
        const tileNode = this._tileNodeRecord[tile.id];
        if (tileNode) {
            if (InternalConfig.ENABLE_IMAGEY_TILE_FADE_OUT) {
                this.fadeOutTileNode(tileNode, tile);
            } else {
                tileNode.recycle();
            }
            delete this._tileNodeRecord[tile.id];
            this._renderTileNodeCount--;
        }
    }

    /**
     * 淡出tileNode
     * @param tileNode 
     */
    private fadeOutTileNode (tileNode: TileNode, tile: QuadtreeTile) {
        if (!this.selfOrParentInFadeout(tileNode, tile)) {
            const obj = { fadeout: 1.0 };
            //set renderer order
            tileNode.mesh.renderOrder = 1;
            this._fadeoutTiles.push(tileNode.tileId);
            new TWEEN.Tween(obj)
                .to({ fadeout: 0.0 }, 300)
                .onUpdate(() => {
                    tileNode.fadeout(obj.fadeout);
                })
                .onComplete(() => {
                    tileNode.recycle();
                    const index = this._fadeoutTiles.indexOf(tileNode.tileId);
                    if (index > -1) {
                        this._fadeoutTiles.splice(index, 1);
                    }
                })
                .start();
        } else {
            tileNode.recycle();
        }

    }

    /**
     * 判断自身或者父级瓦片正在fadeout
     * @param tileNode 
     * @param tile 
     * @returns 
     */
    private selfOrParentInFadeout (tileNode: TileNode, tile: QuadtreeTile) {
        if (this._fadeoutTiles.indexOf(tileNode.tileId) > -1) return true;
        let parent = tile.parent;
        while (parent) {
            if (this._fadeoutTiles.indexOf(parent.id) > -1) {
                return true;
            };
            parent = parent.parent;
        }
        return false;
    }

}
