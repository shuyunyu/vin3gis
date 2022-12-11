import { BufferAttribute, BufferGeometry, Mesh, Texture } from "three";
import { ImageryTileRenderParam, MeshDefines } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { tileMaterialPool } from "../pool/tile_material_pool";
import { tileTexturePool } from "../pool/tile_texture_pool";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { Transform } from "../transform/transform";

/**
 * 瓦片网格
 */
export class TileMesh {

    /**
     * 创建瓦片显示用的mesh
     * @param tile 
     * @param baseTileImagery 当前瓦片的底层贴图
     * @param overlayTileImagery 当前瓦片的上层贴图
     * @returns 
     */
    public static createTileMesh (tile: QuadtreeTile, baseTileImagery?: ImageryTileRenderParam, overlayTileImagery?: ImageryTileRenderParam) {
        let baseTexture: Texture;
        let baseTextureRectangle: Rectangle;
        let baseTextureOpacity = 1.0;
        if (baseTileImagery && baseTileImagery.imagery) {
            baseTexture = tileTexturePool.create(baseTileImagery.imagery.imageAsset);
            baseTextureRectangle = baseTileImagery.imagery.rectangle;
            baseTextureOpacity = baseTileImagery.opacity;
        }
        let overlayTexture: Texture;
        let overlayTextureRectangle: Rectangle;
        let overlayTextureOpacity = 1.0;
        if (overlayTileImagery && overlayTileImagery.imagery) {
            overlayTexture = tileTexturePool.create(overlayTileImagery.imagery.imageAsset);
            overlayTextureRectangle = overlayTileImagery.imagery.rectangle;
            overlayTextureOpacity = overlayTileImagery.opacity;
        }
        const tileNativeRectangle = tile.nativeRectangle;
        const center = tileNativeRectangle.center;
        const plane = new BufferGeometry();
        const meshAttr = this.createTileMeshAttribute(tileNativeRectangle, baseTextureRectangle, overlayTextureRectangle);
        plane.setAttribute('position', new BufferAttribute(meshAttr.vertices, 3));
        plane.setIndex(meshAttr.indices);
        plane.setAttribute('normal', new BufferAttribute(meshAttr.normals, 3));
        if (meshAttr.baseUvs) {
            plane.setAttribute('uv', new BufferAttribute(meshAttr.baseUvs, 2));
        }
        if (meshAttr.overlayUvs) {
            plane.setAttribute('a_overlay_uv', new BufferAttribute(meshAttr.overlayUvs, 2));
        }
        const mtl = tileMaterialPool.create([
            { texture: baseTexture, opacity: baseTextureOpacity },
            { texture: overlayTexture, opacity: overlayTextureOpacity }
        ]);
        const mesh = new Mesh(plane, mtl);
        Transform.earthCar3ToWorldVec3(center, mesh.position);
        return mesh;
    }

    /**
     * 创建tileMesh属性
     * @param tileRectangle 瓦片矩形范围
     * @param baseTextureRectangle 底层贴图矩形范围
     * @param overlayTextureRectangle 上层贴图矩形范围
     * @returns 
     */
    private static createTileMeshAttribute (tileRectangle: Rectangle, baseTextureRectangle?: Rectangle, overlayTextureRectangle?: Rectangle): MeshDefines.TileMeshAttribute {
        const positions: number[] = [];
        const indices: number[] = [];
        const normals: number[] = [];

        const center = tileRectangle.center;

        const xmin = tileRectangle.west - center.x;
        const ymin = tileRectangle.north - center.y;
        const xmax = tileRectangle.east - center.x;
        const ymax = tileRectangle.south - center.y;

        const y = center.z;

        positions.push(xmin, y, ymin);
        positions.push(xmin, y, ymax);
        positions.push(xmax, y, ymax);
        positions.push(xmax, y, ymin);

        indices.push(0, 1, 2, 2, 3, 0);

        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);

        const res: MeshDefines.TileMeshAttribute = {
            vertices: new Float32Array(positions),
            indices: indices,
            normals: new Float32Array(normals)
        };

        if (baseTextureRectangle) {
            res.baseUvs = this.calcUvs(baseTextureRectangle, tileRectangle);
        }

        if (overlayTextureRectangle) {
            res.overlayUvs = this.calcUvs(overlayTextureRectangle, tileRectangle);
        }

        return res;
    }

    /**
     * 计算uvs
     * @param textureRectangle 贴图对应的矩形范围
     * @param tileRectangle 瓦片节点对应的矩形范围
     */
    private static calcUvs (textureRectangle: Rectangle, tileRectangle: Rectangle) {
        let width = textureRectangle.width;
        let height = textureRectangle.height;
        let xmin = (tileRectangle.west - textureRectangle.west) / width;
        let xmax = (tileRectangle.east - textureRectangle.west) / width;
        let ymin = (tileRectangle.south - textureRectangle.south) / height;
        let ymax = (tileRectangle.north - textureRectangle.south) / height;
        return new Float32Array([xmin, ymin, xmin, ymax, xmax, ymax, xmax, ymin]);
    }

}