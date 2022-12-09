import { Mesh, Object3D, ShaderMaterial, Texture } from "three";
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

    private _baseImagery: ImageBitmap;

    //当前节点使用的底层瓦片贴图
    public get baseImagery () {
        return this._baseImagery;
    }

    private _overlayImagery: ImageBitmap;

    //当前节点使用的上层瓦片贴图
    public get overlayImagery () {
        return this._overlayImagery;
    }

    public constructor (tileId: string) {
        this.tileId = tileId;
    }

    /**
     * 渲染瓦片图片
     * @param tile
     * @param imagery 
     * @param imageryRectangle 
     */
    public createTileMesh (tile: QuadtreeTile, imageryRectangle: Rectangle, imagery?: ImageBitmap, overlayImagery?: ImageBitmap) {
        this._mesh = TileMesh.createTileMesh(tile, imageryRectangle, imagery, overlayImagery);
        this._baseImagery = imagery;
        this._overlayImagery = overlayImagery;
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