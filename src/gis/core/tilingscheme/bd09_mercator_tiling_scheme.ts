import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartographic } from "../cartographic";
import { EllipsoidWGS84 } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";
import { BD09MercatorProject } from "../projection/bd09_mercator_projection";
import { WebMercatorTilingScheme } from "./web_mercator_tiling_scheme";

/**
 * bd09墨卡托瓦片剖分方案
 */
export class BD09MercatorTilingScheme extends WebMercatorTilingScheme {

    private resolutions: number[] = [];

    public constructor (isWgs84: boolean = true) {
        super(new BD09MercatorProject(isWgs84, EllipsoidWGS84));
        for (let i = 0; i < 19; i++) {
            this.resolutions[i] = 256 * Math.pow(2, 18 - i);
        }
    }

    public tileXYToRectangle (x: number, y: number, level: number): Rectangle {
        const tileWidth = this.resolutions[level];
        const west = x * tileWidth;
        const east = (x + 1) * tileWidth;
        const north = ((y = -y) + 1) * tileWidth;
        const south = y * tileWidth;
        return new Rectangle(west, south, east, north);
    }

    public positionToTileXY (position: Cartographic, level: number): Cartesian2 {
        const projection = this.projection;
        const rectangle = projection.rectangle;
        let projectedPos = this.projection.project(position);
        if (!rectangle.containsCartesian2(new Cartesian2(projectedPos.x, projectedPos.y))) {
            return undefined;
        }
        const tileWidth = this.resolutions[level];
        const xTileCoordinate = Math.floor(projectedPos.x / tileWidth);
        const yTileCoordinate = -Math.floor(projectedPos.y / tileWidth);
        return new Cartesian2(xTileCoordinate, yTileCoordinate);

    }

}