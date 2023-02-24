import { math } from "../../core/math/math";

/**
 * 经纬度高度对象
 * 经纬度单位:弧度
 */
export class Cartographic {

    public longitude: number = 0;

    public latitude: number = 0;

    public height: number = 0;

    public static readonly ZERO = Object.freeze(new Cartographic(0, 0, 0));

    public constructor (longitudeRad: number = 0, latitudeRad: number = 0, height: number = 0) {
        this.longitude = longitudeRad;
        this.latitude = latitudeRad;
        this.height = height;
    }

    public equals (cartographic: Cartographic) {
        return this.longitude === cartographic.longitude && this.latitude === cartographic.latitude && this.height === cartographic.height;
    }

    public clone () {
        return new Cartographic(this.longitude, this.latitude, this.height);
    }

    /**
     * 从角度数据构建经纬度高度(弧度)对象
     * @param longitude 
     * @param latitude 
     * @param height 
     * @returns 
     */
    public static fromDegrees (longitude: number, latitude: number, height: number = 0) {
        return new Cartographic(math.toRadian(longitude), math.toRadian(latitude), height);
    }

    /**
     * 由数组构建cartographic
     * @param array 
     * @param offset 偏移量
     * @returns 
     */
    public static fromArray (array: number[], offset: number = 0) {
        return new Cartographic(array[offset + 0], array[offset + 1], array[offset + 2]);
    }

    public toArray (out?: number[]) {
        out = out || new Array(3);
        out[0] = this.longitude;
        out[1] = this.latitude;
        out[2] = this.height;
        return out;
    }

    public static clone (origin: Cartographic, out?: Cartographic) {
        out = out || new Cartographic();
        out.longitude = origin.longitude;
        out.latitude = origin.latitude;
        out.height = origin.height;
        return out;
    }

}