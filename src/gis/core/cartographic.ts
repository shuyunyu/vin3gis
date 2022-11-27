import { math } from "../../core/math/math";

/**
 * 经纬度高度对象
 * 经纬度单位:弧度
 */
export class Cartographic {

    public longitude: number = 0;

    public latitude: number = 0;

    public height: number = 0;

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
    public static fromDegrees (longitude: number, latitude: number, height: number) {
        return new Cartographic(math.toRadians(longitude), math.toRadians(latitude), height);
    }

    public static clone (origin: Cartographic, out?: Cartographic) {
        out = out || new Cartographic();
        out.longitude = origin.longitude;
        out.latitude = origin.latitude;
        out.height = origin.height;
        return out;
    }

}