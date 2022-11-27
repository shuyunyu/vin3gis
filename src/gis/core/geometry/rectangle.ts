import { math } from "../../../core/math/math";
import { ICartesian2Like } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";

export class Rectangle {

    private _west: number = 0;
    private _south: number = 0;
    private _east: number = 0;
    private _north: number = 0;

    private _southWest: Cartesian3;

    private _northWest: Cartesian3;

    private _southEast: Cartesian3;

    private _northEast: Cartesian3;

    private _width: number;

    private _height: number;

    private _center: Cartesian3;

    public get width () {
        return this._width;
    }

    public get height () {
        return this._height;
    }

    public get south () {
        return this._south;
    }

    public get north () {
        return this._north;
    }

    public get east () {
        return this._east;
    }

    public get west () {
        return this._west;
    }

    public get southWest () {
        return this._southWest;
    }

    public get northWest () {
        return this._northWest;
    }

    public get southEast () {
        return this._southEast;
    }

    public get northEast () {
        return this._northEast;
    }

    public get center () {
        return this._center;
    }

    constructor (west: number, south: number, east: number, north: number) {
        this._west = west;
        this._south = south;
        this._east = east;
        this._north = north;
        this._southWest = new Cartesian3(this._west, this._south, 0);
        this._northWest = new Cartesian3(this._west, this._north, 0);
        this._southEast = new Cartesian3(this._east, this._south, 0);
        this._northEast = new Cartesian3(this._east, this._north, 0);
        this._width = this.computeWidth();
        this._height = this.computeHeight();
        let xOffset = this._east - this._west;
        let yOffset = this._north - this._south;
        this._center = new Cartesian3(this._west + xOffset / 2, this._south + yOffset / 2, 0);
    }


    public computeWidth () {
        return Math.abs(this._east - this._west);
    }

    public computeHeight () {
        return Math.abs(this._north - this._south);
    }

    public clone () {
        return new Rectangle(this._west, this._south, this._east, this._north);
    }

    public containsCartesian2 (cartesian2: ICartesian2Like) {
        return this._west <= cartesian2.x && this._east >= cartesian2.x && this._south <= cartesian2.y && this._north >= cartesian2.y;
    }

    public contains (rectangle: Rectangle) {
        return this.containsCartesian2(rectangle.southWest) && this.containsCartesian2(rectangle.northEast);
    }

    /**
     * 计算 弧度表示的 矩形的 地理中心点
     * @param rectangle 
     * @param out 
     */
    public static center (rectangle: Rectangle, out?: Cartographic) {
        let east = rectangle.east;
        let west = rectangle.west;
        if (east < west) {
            east += math.TWO_PI;
        }
        let longitude = math.negativePiToPi((west + east) * 0.5);
        let latitude = (rectangle.south + rectangle.north) * 0.5;
        if (out) {
            out.longitude = longitude;
            out.latitude = latitude;
            return out!;
        }
        out = new Cartographic(longitude, latitude, 0);
        return out;
    }

}