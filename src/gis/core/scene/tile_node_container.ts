import { UniqueList } from "../../../core/extend/unique_list";
import { TileNode } from "./tile_node";

/**
 * 瓦片节点容器
 */
export class TileNodeContainer {

    private _list: UniqueList<TileNode> = new UniqueList();

    public constructor () {

    }

    /**
     * 添加瓦片节点
     * @param tileNode 
     */
    public addTileNode (tileNode: TileNode) {

    }

    /**
     * 移除瓦片节点
     * @param tileNode 
     */
    public removeTileNode (tileNode: TileNode) {

    }

}