import { Mesh, MeshBasicMaterial, Object3D } from "three";
import { Rectangle } from "../geometry/rectangle";
import { TileMesh } from "../mesh/tile_mesh";
import { tileMaterialPool } from "../pool/tile_material_pool";
import { tileTexturePool } from "../pool/tile_texture_pool";
import { QuadtreeTile } from "../scene/quad_tree_tile";

/**
 * 定义瓦片节点
 */
export class TileNode {

    public readonly tileId: string;

    private _mesh: Mesh;

    public get mesh () {
        return this._mesh;
    }

    public constructor (tileId: string) {
        this.tileId = tileId;
    }

    /**
     * 渲染瓦片图片
     * @param tile
     * @param imagery 
     * @param imageryRectange 
     */
    public renderTileImagery (tile: QuadtreeTile, imagery: ImageBitmap, imageryRectange: Rectangle, parent: Object3D) {
        this._mesh = TileMesh.createTileMesh(tile, imageryRectange, imagery);
        parent.add(this._mesh);
    }

    /**
     * 取消渲染瓦片图片
     */
    public unrenderTileImagery () {
        this.recycle();
    }

    /**
     * 回收此瓦片节点 并释放资源
     */
    private recycle () {
        if (!this._mesh) return;
        const mtl = this._mesh.material as MeshBasicMaterial;
        if (mtl) {
            const texture = mtl.map;
            if (texture) tileTexturePool.recycle(texture);
            tileMaterialPool.recycle(mtl);
        }
        this._mesh.geometry.dispose();
        this._mesh.removeFromParent();
        this._mesh = null;
    }

}