import { Object3D } from "three";
import { TWEEN } from "../../../core/tween/Index";
import Tween from "../../../core/tween/Tween";
import { ImageryTileRenderParam } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { InternalConfig } from "../internal/internal_config";
import { TILE_NODE_EFFECT_RENDER_ORDER, TILE_NODE_RENDER_ORDER } from "../misc/render_order";
import { Fog } from "../scene/fog";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { TileNode } from "./tile_node";

type fadeoutObj = {
    fadeout: number;
}

type FadeoutTile = {
    id: string;
    rectangle: Rectangle;
    tween: Tween<fadeoutObj>;
}

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
    private _fadeoutTiles: FadeoutTile[] = [];

    private _fog: Fog;

    public constructor (fog: Fog) {
        this._fog = fog;
        this._fog.changedEvent.addEventListener(this.updateByFog, this);
    }

    /**
     * 渲染瓦片贴图
     * @param baseImagery 底层瓦片贴图
     * @param overlayImagery 上层瓦片贴图
     */
    public render (tile: QuadtreeTile, baseImagery?: ImageryTileRenderParam, overlayImagery?: ImageryTileRenderParam) {
        this.unrender(tile);
        //必须有一个才渲染
        if (!baseImagery && !overlayImagery) return;
        const hasBaseImagery = baseImagery && baseImagery.imagery;
        const hasOverlayImagery = overlayImagery && overlayImagery.imagery;
        //至少有一张图片才执行渲染
        if (!hasBaseImagery && !hasOverlayImagery) return;
        let tileNode = new TileNode(tile.id);
        this._tileNodeRecord[tile.id] = tileNode;
        const mesh = tileNode.createTileMesh(tile, baseImagery, overlayImagery);
        mesh.renderOrder = TILE_NODE_RENDER_ORDER;
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
     * 根据fog来更新瓦片的渲染效果
     */
    private updateByFog (fog: Fog) {

    }

    /**
     * 淡出tileNode
     * @param tileNode 
     */
    private fadeOutTileNode (tileNode: TileNode, tile: QuadtreeTile) {
        if (!this.selfOrParentInFadeout(tileNode, tile)) {
            const obj = { fadeout: 1.0 };
            //set renderer order
            tileNode.mesh.renderOrder = TILE_NODE_EFFECT_RENDER_ORDER;
            const tween = new TWEEN.Tween(obj)
                .to({ fadeout: 0.0 }, 300)
                .onUpdate(() => {
                    tileNode.fadeout(obj.fadeout);
                })
                .onComplete(() => {
                    tileNode.recycle();
                    const index = this.findFadeoutTileIndex(tileNode.tileId);
                    if (index > -1) {
                        this._fadeoutTiles.splice(index, 1);
                    }
                });
            this._fadeoutTiles.push({
                id: tileNode.tileId,
                rectangle: tile.rectangle,
                tween: tween
            });
            tween.start();
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
        if (this.findFadeoutTileIndex(tileNode.tileId) > -1) return true;
        let parent = tile.parent;
        while (parent) {
            if (this.findFadeoutTileIndex(tileNode.tileId) > -1) {
                return true;
            };
            parent = parent.parent;
        }
        return false;
    }

    /**
     * 查找fadeoutTile的索引
     * @param tileId 
     * @returns 
     */
    private findFadeoutTileIndex (tileId: string) {
        return this._fadeoutTiles.findIndex(item => item.id === tileId);
    }

}
