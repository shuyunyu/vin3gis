import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Ellipsoid, EllipsoidWGS84 } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";
import { IProjection } from "./projection";

export class BaseProjection implements IProjection {

    protected _center: Cartesian2;

    protected _ellipsoid: Ellipsoid;

    protected _rectangle: Rectangle;

    public get ellipsoid () {
        return this._ellipsoid!;
    }

    public get center () {
        return new Cartesian2(0.0, 0.0);
    }

    public get rectangle () {
        return this._rectangle;
    }

    public constructor (ellipsoid?: Ellipsoid) {
        this._center = new Cartesian2(0.0, 0.0);
        this._ellipsoid = ellipsoid ?? EllipsoidWGS84;
        this._rectangle = null;
    }

    public project (cartographic: Cartographic, out?: Cartesian3): Cartesian3 {
        throw new Error("Method not implemented.");
    }

    public unproject (cartesian3: Cartesian3, out?: Cartographic): Cartographic {
        throw new Error("Method not implemented.");
    }

}