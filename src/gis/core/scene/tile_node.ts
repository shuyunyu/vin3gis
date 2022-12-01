import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";
import { math } from "../../../core/math/math";
import { Rectangle } from "../geometry/rectangle";
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
        mtl.dispose();
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
    public static create (provider: IImageryTileProvider, tile: QuadtreeTile, texture: Texture) {
        const mesh = this.createTileMesh(tile, texture);
        return new TileNode(provider, mesh);
    }

    /**
     * 创建瓦片显示用的mesh
     * @param tile 
     */
    private static createTileMesh (tile: QuadtreeTile, texture: Texture) {
        const tileNativeRectangle = tile.nativeRectangle;
        const center = tileNativeRectangle.center;
        const plane = new PlaneGeometry(tileNativeRectangle.width, tileNativeRectangle.height);
        const mtl = new MeshBasicMaterial({ map: texture, transparent: true, side: DoubleSide });
        const mesh = new Mesh(plane, mtl);
        mesh.rotateX(-math.PI_OVER_TWO);
        Transform.earthCar3ToWorldVec3(center, mesh.position);
        return mesh;
    }

}