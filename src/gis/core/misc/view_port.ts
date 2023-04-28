import { Cartographic } from "../cartographic";
import { Orientation } from "./orientation";

/**
 * 视角
 */
export class ViewPort {

    //位置
    private _cartographic: Cartographic;

    //视角
    private _orientation: Orientation;

    public get cartogarphic () {
        return this._cartographic;
    }

    public get orientation () {
        return this._orientation;
    }

    public constructor (cartographic: Cartographic = new Cartographic(), orientation: Orientation = new Orientation()) {
        this._cartographic = cartographic;
        this._orientation = orientation;
    }

    public clone () {
        return new ViewPort(this.cartogarphic.clone(), this.orientation.clone());
    }

    /**
     * 从数组构建 ViewPort
     * - e.g. [lon,lat,height] , [lon,lat,height,yaw,pitch,roll]
     * @param array 
     */
    public static fromArray (array: number[]) {
        let cartogarphic: Cartographic = Cartographic.fromArray(array);
        let orientation: Orientation = array.length > 3 ? Orientation.fromArray(array, 3) : new Orientation(0, -90, 0);
        return new ViewPort(cartogarphic, orientation);
    }

}
