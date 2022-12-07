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

    private _tileNodeRecord: Record<string, TileNode> = Object.create(null);

    public constructor () {

    }

    public render (tileImagery: TileImagery) {
        this.unrender(tileImagery);
        let tileNode = new TileNode(tileImagery.tile.id);
        this._tileNodeRecord[tileImagery.tile.id] = tileNode;
        tileNode.renderTileImagery(tileImagery.tile, tileImagery.textureImagery.imageAsset, tileImagery.textureImagery.rectangle, this.root);
    }

    public unrender (tileImagery: TileImagery) {
        const tileNode = this._tileNodeRecord[tileImagery.tile.id];
        if (tileNode) {
            tileNode.unrenderTileImagery();
        }
    }

}
