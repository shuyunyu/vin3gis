import { Utils } from "../../../core/utils/utils";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Ellipsoid } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";
import { BaseProjection } from "./base_projection";

export class GeographicProjection extends BaseProjection {

    private R: number = 6378137;

    private _semimajorAxis: number;

    private _oneOverSemimajorAxis: number;

    public get ellipsoid () {
        return this._ellipsoid;
    }

    constructor (ellipsoid?: Ellipsoid) {
        super(ellipsoid);
        this._semimajorAxis = this._ellipsoid.maximumRadius;
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
    }

    public getRectangle (): Rectangle {
        if (this.rectangle !== undefined) {
            return this.rectangle;
        }
        let d = this.R * Math.PI;
        this._rectangle = new Rectangle(-d, -d, d, d);
        return this.rectangle;
    }
    public project (cartographic: Cartographic, out?: Cartesian3): Cartesian3 {
        let semimajorAxis = this._semimajorAxis;
        let x = cartographic.longitude * semimajorAxis;
        let y = cartographic.latitude * semimajorAxis;
        let z = cartographic.height;
        if (Utils.defined(out)) {
            out!.x = x;
            out!.y = y;
            out!.z = z;
            return out!;
        }
        return new Cartesian3(x, y, z);
    }
    public unproject (cartesian: Cartesian3, out?: Cartographic): Cartographic {
        let oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis;
        let longitude = cartesian.x * oneOverEarthSemimajorAxis;
        let latitude = cartesian.y * oneOverEarthSemimajorAxis;
        let height = cartesian.z;
        if (Utils.defined(out)) {
            out!.longitude = longitude;
            out!.latitude = latitude;
            out!.height = height;
            return out!;
        }
        return new Cartographic(longitude, latitude, height);
    }


}