import { Mesh, ShaderMaterial, Texture } from "three";
import { TileMesh } from "../mesh/tile_mesh";
import { tileMaterialPool } from "../pool/tile_material_pool";
import { tileTexturePool } from "../pool/tile_texture_pool";
import { Imagery } from "../scene/imagery";
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
     * @param baseImagery 
     * @param overlayImagery 
     */
    public createTileMesh (tile: QuadtreeTile, baseImagery?: Imagery, overlayImagery?: Imagery) {
        this._mesh = TileMesh.createTileMesh(tile, baseImagery, overlayImagery);
        return this._mesh;
    }

    /**
     * 回收此瓦片节点 并释放资源
     */
    public recycle () {
        if (!this._mesh) return;
        const mtl = this._mesh.material as ShaderMaterial;
        if (mtl) {
            for (const key in mtl.uniforms) {
                const val = mtl.uniforms[key].value;
                if (val instanceof Texture) {
                    tileTexturePool.recycle(val);
                }
            }
            tileMaterialPool.recycle(mtl);
        }
        this._mesh.geometry.dispose();
        this._mesh.removeFromParent();
        this._mesh = null;
    }

}