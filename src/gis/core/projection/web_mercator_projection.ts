import { math } from "../../../core/math/math";
import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Ellipsoid } from "../ellipsoid/ellipsoid";
import { Rectangle } from "../geometry/rectangle";
import { BaseProjection } from "./base_projection";

export class WebMercatorProjection extends BaseProjection {

    private R: number = 6378137;

    private _semimajorAxis: number;

    private _oneOverSemimajorAxis: number;

    private _maximumLatitude: number;

    public constructor (ellipsoid?: Ellipsoid, specRectangle?: Rectangle) {
        super(ellipsoid);
        if (specRectangle) {
            this._rectangle = specRectangle.clone();
        } else {
            this._semimajorAxis = this.ellipsoid.maximumRadius;
            this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
            this._maximumLatitude = this.mercatorAngleToGeodeticLatitude(Math.PI);
            let d = this.R * Math.PI;
            this._rectangle = new Rectangle(-d, -d, d, d);
        }
    }

    public project (cartographic: Cartographic, out?: Cartesian3): Cartesian3 {
        return this.doProject(this.center, cartographic, out);
    }

    private doProject (center: Cartesian2, cartographic: Cartographic, out?: Cartesian3) {
        let semimajorAxis = this._semimajorAxis;
        let x = cartographic.longitude * semimajorAxis;
        let y =
            this.geodeticLatitudeToMercatorAngle(
                cartographic.latitude
            ) * semimajorAxis;
        let z = cartographic.height;
        x -= center.x;
        y -= center.y;
        if (out) {
            out.x = x;
            out.y = y;
            out.z = z;
            return out!;
        }
        return new Cartesian3(x, y, z);
    }

    public unproject (cartesian: Cartesian3, out?: Cartographic): Cartographic {
        let center = this.center;
        let oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis;
        let longitude = (cartesian.x + center.x) * oneOverEarthSemimajorAxis;
        let latitude = this.mercatorAngleToGeodeticLatitude(
            (cartesian.y + center.y) * oneOverEarthSemimajorAxis
        );
        let height = cartesian.z;
        if (out) {
            out.longitude = longitude;
            out.latitude = latitude;
            out.height = height;
            return out;
        }
        return new Cartographic(longitude, latitude, height);
    }

    /**
     * Converts a Mercator angle, in the range -PI to PI, to a geodetic latitude
     * in the range -PI/2 to PI/2.
     * @param mercatorAngle 
     */
    public mercatorAngleToGeodeticLatitude (mercatorAngle: number) {
        return math.PI_OVER_TWO - 2.0 * Math.atan(Math.exp(-mercatorAngle));
    }

    /**
     * Converts a geodetic latitude in radians, in the range -PI/2 to PI/2, to a Mercator
     * angle in the range -PI to PI.
     * @param latitude 
     */
    public geodeticLatitudeToMercatorAngle (latitude: number) {
        // Clamp the latitude coordinate to the valid Mercator bounds.
        if (latitude > this._maximumLatitude) {
            latitude = this._maximumLatitude;
        } else if (latitude < -this._maximumLatitude) {
            latitude = -this._maximumLatitude;
        }
        let sinLatitude = Math.sin(latitude);
        return 0.5 * Math.log((1.0 + sinLatitude) / (1.0 - sinLatitude));
    }

}

export const webMercatorProjection = Object.freeze(new WebMercatorProjection());