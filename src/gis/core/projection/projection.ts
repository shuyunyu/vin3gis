import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Ellipsoid } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";

/**
 * 地图投影 接口
 */
export interface IProjection {
    //投影中心点 默认 (0,0)
    center: Cartesian2;
    //投影范围
    rectangle: Rectangle;
    //参考椭球体
    ellipsoid: Ellipsoid;
    //将 弧度 地理坐标 投影为 Cartesian3 笛卡尔坐标
    project (cartographic: Cartographic, out?: Cartesian3): Cartesian3;
    //将 Cartesian3 笛卡尔坐标 转换为 弧度 地理坐标
    unproject (cartesian3: Cartesian3, out?: Cartographic): Cartographic;
}