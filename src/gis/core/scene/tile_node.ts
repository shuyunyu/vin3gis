import { Texture } from "three";
import { Rectangle } from "../geometry/rectangle";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { QuadtreeTile } from "./quad_tree_tile";

/**
 * 定义瓦片节点
 * 管理单个瓦片的渲染
 */
export class TileNode {

    public constructor () {

    }

    /**
     * 创建一个瓦片节点
     * @param provider 
     * @param tile 
     * @param texture 瓦片贴图
     * @param imageryRectangle 瓦片贴图对应的坐标矩形 
     * @returns 
     */
    public static create (provider: IImageryTileProvider, tile: QuadtreeTile, texture: Texture, imageryRectangle: Rectangle) {
        const tileNativeRectangle = tile.nativeRectangle;
        return new TileNode();
    }

}