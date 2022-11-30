import { Object3D } from "three";
import { UniqueList } from "../../../core/extend/unique_list";
import { TileNode } from "./tile_node";

/**
 * 瓦片节点容器
 */
export class TileNodeContainer {

    private _list: UniqueList<TileNode> = new UniqueList();

    //需要挂到场景中的object
    private _object3d: Object3D;

    public get object3d () {
        return this._object3d;
    }

    public constructor () {
        this._object3d = new Object3D();
    }

    /**
     * 添加瓦片节点
     * @param tileNode 
     */
    public addTileNode (tileNode: TileNode) {
        if (this._list.add(tileNode)) {
            this._object3d.add(tileNode.mesh);
        }
    }

    /**
     * 移除瓦片节点
     * @param tileNode 
     */
    public removeTileNode (tileNode: TileNode) {
        if (this._list.remove(tileNode)) {
            this._object3d.remove(tileNode.mesh);
        }
    }

}