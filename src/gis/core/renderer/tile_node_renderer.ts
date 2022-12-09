import { Object3D } from "three";
import { TileImagery } from "../scene/tile_imagery";
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
     * @param tileImagery 底层瓦片贴图
     * @param overlayImagery 上层瓦片贴图
     */
    public render (tileImagery: TileImagery, overlayImagery?: TileImagery) {
        const tileImageAsset = tileImagery.textureImagery.imageAsset;
        const overlayImageAsset = overlayImagery ? overlayImagery.textureImagery.imageAsset : null;
        const oldTileNode = this._tileNodeRecord[tileImagery.tile.id];
        //原来的节点还是渲染当前的瓦片 仅需要替换上层的瓦片即可
        if (oldTileNode && oldTileNode.imagery === tileImageAsset) {
            oldTileNode.updateTileMesh(overlayImageAsset);
        } else {
            //原来的节点使用的不是这张贴图   那么就需要取消瓦片渲染
            this.unrender(tileImagery);
            let tileNode = new TileNode(tileImagery.tile.id);
            this._tileNodeRecord[tileImagery.tile.id] = tileNode;
            const mesh = tileNode.createTileMesh(tileImagery.tile, tileImageAsset, tileImagery.textureImagery.rectangle, overlayImagery ? overlayImageAsset : null);
            this.root.add(mesh);
        }

    }

    /**
     * 取消瓦片贴图的渲染
     * @param tileImagery 
     */
    public unrender (tileImagery: TileImagery) {
        const tileNode = this._tileNodeRecord[tileImagery.tile.id];
        if (tileNode) {
            tileNode.recycle();
            delete this._tileNodeRecord[tileImagery.tile.id];
        }
    }

}
