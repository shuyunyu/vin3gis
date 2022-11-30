import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { TileNode } from "../scene/tile_node";

export class TileNodeCache {

    private _provider: IImageryTileProvider;

    public constructor (provider: IImageryTileProvider) {
        this._provider = provider;
    }

    /**
     * 回收瓦片节点
     * @param tileNode 
     */
    public recyleTileNode (tileNode: TileNode) {

    }

}
