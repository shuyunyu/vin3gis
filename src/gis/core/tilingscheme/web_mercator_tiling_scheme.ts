import { Sphere, Vector3 } from "three";
import { GeometryUtils } from "../../utils/geometry_utils";
import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { EllipsoidWGS84 } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";
import { IProjection } from "../projection/projection";
import { WebMercatorProjection } from "../projection/web_mercator_projection";
import { Transform } from "../transform/transform";
import { ITilingScheme } from "./tiling_scheme";

const tempCar3 = new Cartesian3();
const tempVec3 = new Vector3();

export class WebMercatorTilingScheme implements ITilingScheme {

    //投影
    public projection: IProjection;

    public readonly tileWidth = 256;

    public readonly tileHeight = 256;

    //level 为0时  x方向的瓦片数目
    private _numberOfLevelZeroTilesX: number = 1;

    //level 为0时  y方向的瓦片数目
    private _numberOfLevelZeroTilesY: number = 1;

    // box的高度 单位 米
    private _boxHeight: number = 0;

    public constructor (projection?: IProjection) {
        this.projection = projection ?? new WebMercatorProjection(EllipsoidWGS84);
    }

    /**
     * 获取指定等级下的分辨率 米/像素
     * @param level 
     */
    public getResolutionAtLevel (level: number) {
        let xTiles = this.getNumberOfXTilesAtLevel(level);
        return this.projection.rectangle.width / xTiles / this.tileWidth;
    }

    /**
     * 获取指定等级下 X方向的瓦片数目
     * @param level 
     * @returns 
     */
    public getNumberOfXTilesAtLevel (level: number) {
        return this._numberOfLevelZeroTilesX << level;
    }

    /**
     * 获取指定等级下 Y方向的瓦片数目
     * @param level 
     * @returns 
     */
    public getNumberOfYTilesAtLevel (level: number) {
        return this._numberOfLevelZeroTilesY << level;
    }

    /**
     * 将瓦片转换为投影坐标系的 Recgangle 米制单位
     * @param x 
     * @param y 
     * @param level 
     */
    public tileXYToRectangle (x: number, y: number, level: number) {
        let xTiles = this.getNumberOfXTilesAtLevel(level);
        let yTiles = this.getNumberOfYTilesAtLevel(level);
        let rectangle = this.projection.rectangle;
        let xTileWidth = rectangle.width / xTiles;
        let yTileWidth = rectangle.height / yTiles;
        let center = this.projection.center;
        let west = rectangle.southWest.x + x * xTileWidth - center.x;
        let east = rectangle.southWest.x + (x + 1) * xTileWidth - center.x;
        let north = rectangle.northEast.y - y * yTileWidth - center.y;
        let south = rectangle.northEast.y - (y + 1) * yTileWidth - center.y;
        return new Rectangle(west, south, east, north);
    }

    /**
     * 将瓦片转换为 本地坐标系 的 Rectangle    threejs单位
     * @param x 
     * @param y 
     * @param level 
     */
    public tileXYToNativeRectangle (x: number, y: number, level: number) {
        let rectangle = this.tileXYToRectangle(x, y, level);
        let mertersPerUnit = Transform.getMetersPerUnit();
        let west = rectangle.southWest.x / mertersPerUnit;
        let south = rectangle.southWest.y / mertersPerUnit;
        let east = rectangle.northEast.x / mertersPerUnit;
        let north = rectangle.northEast.y / mertersPerUnit;
        return new Rectangle(west, south, east, north);
    }

    /**
     * 将瓦片转换为 本地坐标系 的 AABB
     * @param x 
     * @param y 
     * @param level 
     */
    public tileXYToNativeAABB (x: number, y: number, level: number) {
        let rectangle = this.tileXYToNativeRectangle(x, y, level);
        let center = rectangle.center;
        let t_center = Transform.earthCar3ToWorldCar3(center, tempCar3);
        let height = this._boxHeight;
        return GeometryUtils.createBox3(t_center, rectangle.width / 2, height / 2, rectangle.height / 2);
    }


    /**
     * 
     * @param x 将瓦片转换为 本地坐标系 的 Shpere
     * @param y 
     * @param level 
     * @returns 
     */
    public tileXYToNativeShpere (x: number, y: number, level: number) {
        let rectangle = this.tileXYToNativeRectangle(x, y, level);
        let center = rectangle.center;
        let t_center = Transform.earthCar3ToWorldCar3(center, tempCar3);
        let width = rectangle.width;
        return new Sphere(Cartesian3.toVec3(t_center, tempVec3), width / 2);
    }

    /**
     * 将 cartographic 转换为对应等级下的XY瓦片
     * @param position 
     * @param level 
     */
    public positionToTileXY (position: Cartographic, level: number): Cartesian2 | undefined {
        let rectangle = this.projection.rectangle;
        let projectedPos = this.projection.project(position);
        if (!rectangle.containsCartesian2(new Cartesian2(projectedPos.x, projectedPos.y))) {
            return undefined;
        }
        let xTiles = this.getNumberOfXTilesAtLevel(level);
        let yTiles = this.getNumberOfYTilesAtLevel(level);
        let xTileWidth = rectangle.width / xTiles;
        let yTileWidth = rectangle.height / yTiles;
        let distanceFromWest = projectedPos.x - rectangle.southWest.x;
        let distanceFromNorth = rectangle.northEast.y - projectedPos.y;

        let xTileCoordinate = (distanceFromWest / xTileWidth) | 0;
        if (xTileCoordinate >= xTiles) {
            xTileCoordinate = xTiles - 1;
        }

        let yTileCoordinate = (distanceFromNorth / yTileWidth) | 0;
        if (yTileCoordinate >= yTiles) {
            yTileCoordinate = yTiles - 1;
        }

        return new Cartesian2(xTileCoordinate, yTileCoordinate);

    }

}