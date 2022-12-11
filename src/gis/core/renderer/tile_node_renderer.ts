import { Object3D } from "three";
import { Imagery } from "../scene/imagery";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { TileNode } from "./tile_node";

/**
 * 瓦片节点渲染器
 */
export class TileNodeRenderer {

    //渲染器根节点
    public readonly root = new Object3D();

    private _tileNodeRecord: Record<string, TileNode> = Object.create(null);

    //当前渲染瓦片节点数量
    public get renderTileNodeCount () {
        return Object.keys(this._tileNodeRecord).length;
    }

    public constructor () { }

    /**
     * 渲染瓦片贴图
     * @param baseImagery 底层瓦片贴图
     * @param overlayImagery 上层瓦片贴图
     */
    public render (tile: QuadtreeTile, baseImagery?: Imagery, overlayImagery?: Imagery) {
        this.unrender(tile);
        //必须有一个才渲染
        if (!baseImagery && !overlayImagery) return;
        let tileNode = new TileNode(tile.id);
        this._tileNodeRecord[tile.id] = tileNode;
        const mesh = tileNode.createTileMesh(tile, baseImagery, overlayImagery);
        this.root.add(mesh);
    }

    /**
     * 取消瓦片贴图的渲染
     * @param tile 
     */
    public unrender (tile: QuadtreeTile) {
        const tileNode = this._tileNodeRecord[tile.id];
        if (tileNode) {
            tileNode.recycle();
            delete this._tileNodeRecord[tile.id];
        }
    }

}
