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

    constructor (cartographic: Cartographic, orientation: Orientation) {
        this._cartographic = cartographic;
        this._orientation = orientation;
    }

    clone () {
        return new ViewPort(this.cartogarphic.clone(), this.orientation.clone());
    }

}
