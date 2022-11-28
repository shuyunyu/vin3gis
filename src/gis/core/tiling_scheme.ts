import { Cartesian2 } from "./cartesian/cartesian2";
import { Cartographic } from "./cartographic";
import { Rectangle } from "./geometry/rectangle";
import { IProjection } from "./projection/projection";

/**
 * 规定瓦片 方案的 接口
 */
export interface ITilingScheme {
    //投影
    projection: IProjection
    //获取指定等级下的分辨率 米/像素
    getResolutionAtLevel (level: number): number;
    //获取指定等级下 X方向的瓦片数目
    getNumberOfXTilesAtLevel (level: number): number;
    //获取指定等级下 Y方向的瓦片数目
    getNumberOfYTilesAtLevel (level: number): number;
    //将瓦片转换为投影坐标系的 Recgangle 米制单位
    tileXYToRectangle (x: number, y: number, level: number): Rectangle;
    //将瓦片转换为 本地坐标系 的 Rectangle    creator单位
    tileXYToNativeRectangle (x: number, y: number, level: number): Rectangle;
    //将瓦片转换为 本地坐标系 的 AABB
    // tileXYToNativeAABB (x: number, y: number, level: number): geometry.AABB;
    //将瓦片转换为 本地坐标系 的 Shpere
    // tileXYToNativeShpere (x: number, y: number, level: number): geometry.Sphere;
    //将 cartographic 转换为对应等级下的XY瓦片
    positionToTileXY (position: Cartographic, level: number): Cartesian2 | undefined;
}