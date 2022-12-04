import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, Texture } from "three";
import { MeshDefines } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { tileMaterialPool } from "../pool/tile_material_pool";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { Transform } from "../transform/transform";
import { QuadtreeTile } from "./quad_tree_tile";

/**
 * 定义瓦片节点
 * 管理单个瓦片的渲染
 */
export class TileNode {

    private _provider: IImageryTileProvider;

    private _mesh: Mesh;

    public get mesh () {
        return this._mesh;
    }

    private _recycled: boolean = false;

    public constructor (provider: IImageryTileProvider, mesh: Mesh) {
        this._provider = provider;
        this._mesh = mesh;
        this._recycled = false;
    }

    /**
     * 渲染此瓦片节点
     */
    public render () {
        if (this._recycled) return;
        this._provider.tileNodeContainer.addTileNode(this);
    }

    /**
     * 回收此瓦片节点 并释放资源
     */
    public recycle () {
        if (this._recycled) return;
        this._provider.tileNodeContainer.removeTileNode(this);
        const mtl = this._mesh.material as MeshBasicMaterial;
        if (mtl) tileMaterialPool.recycle(mtl);
        this._mesh.geometry.dispose();
        //贴图不销毁 
        //贴图可能在多个node中使用
        this._mesh = null;
        this._provider = null;
    }

    /**
     * 创建一个瓦片节点
     * @param provider 
     * @param tile 
     * @param texture 瓦片贴图
     * @returns 
     */
    public static create (provider: IImageryTileProvider, tile: QuadtreeTile, texture: Texture, imageryRectangle: Rectangle) {
        const mesh = this.createTileMesh(tile, texture, imageryRectangle);
        return new TileNode(provider, mesh);
    }

    /**
     * 创建瓦片显示用的mesh
     * @param tile 
     * @param texture
     * @param imageryRectangle
     */
    private static createTileMesh (tile: QuadtreeTile, texture: Texture, imageryRectangle: Rectangle) {
        const tileNativeRectangle = tile.nativeRectangle;
        const center = tileNativeRectangle.center;
        const plane = new BufferGeometry();
        const meshAttr = this.createTileMeshAttribute(imageryRectangle, tileNativeRectangle);
        plane.setAttribute('position', new BufferAttribute(meshAttr.vertices, 3));
        plane.setIndex(meshAttr.indices);
        plane.setAttribute('normal', new BufferAttribute(meshAttr.normals, 3));
        plane.setAttribute('uv', new BufferAttribute(meshAttr.uvs, 2));
        const mtl = tileMaterialPool.create(texture);
        const mesh = new Mesh(plane, mtl);
        Transform.earthCar3ToWorldVec3(center, mesh.position);
        return mesh;
    }

    private static createTileMeshAttribute (textureRectangle: Rectangle, tileRectangle: Rectangle): MeshDefines.TileMeshAttribute {
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

        return {
            vertices: new Float32Array(positions),
            indices: indices,
            normals: new Float32Array(normals),
            uvs: this.calcUvs(textureRectangle, tileRectangle)
        }
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