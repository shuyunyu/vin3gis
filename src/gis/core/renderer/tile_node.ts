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

    //当前节点使用的瓦片贴图
    private _imagery: ImageBitmap;

    public get imagery () {
        return this._imagery;
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
    public createTileMesh (tile: QuadtreeTile, imagery: ImageBitmap, imageryRectangle: Rectangle, overlayImagery?: ImageBitmap) {
        this._mesh = TileMesh.createTileMesh(tile, imageryRectangle, imagery, overlayImagery);
        this._imagery = imagery;
        return this._mesh;
    }

    /**
     * 更新瓦片贴图渲染
     * @param overlayImagery 上层贴图
     */
    public updateTileMesh (overlayImagery: ImageBitmap) {
        const mtl = this._mesh.material as ShaderMaterial;
        if (mtl) {
            mtl.uniforms[tileMaterialPool.overlayTexture].value = overlayImagery;
            mtl.needsUpdate = true;
        }
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