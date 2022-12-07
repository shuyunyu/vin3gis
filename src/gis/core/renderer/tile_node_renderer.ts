import { Object3D } from "three";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { TileImagery } from "../scene/tile_imagery";
import { TileNode } from "./tile_node";

/**
 * 瓦片节点渲染器
 */
export class TileNodeRenderer {

    //渲染器根节点
    public readonly root = new Object3D();

    private _tileNodeList: TileNode[] = [];

    public constructor () {

    }

    public render (tileImagery: TileImagery) {
        this.unrender(tileImagery);
        let tileNode = new TileNode(tileImagery.tile.id);
        this._tileNodeList.push(tileNode);
        tileNode.renderTileImagery(tileImagery.tile, tileImagery.textureImagery.imageAsset, tileImagery.textureImagery.rectangle, this.root);
    }

    public unrender (tileImagery: TileImagery) {
        const index = this.findTileNodeIndex(tileImagery.tile);
        if (index > -1) {
            const tileNode = this._tileNodeList.splice(index, 1)[0];
            tileNode.unrenderTileImagery();
        }
    }

    private findTileNodeIndex (tile: QuadtreeTile) {
        return this._tileNodeList.findIndex(tn => tn.tileId === tile.id);
    }

    private findTileNode (tile: QuadtreeTile) {
        const index = this.findTileNodeIndex(tile);
        return index > -1 ? this._tileNodeList[index] : null;
    }

}
