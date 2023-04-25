import { math } from "../../../core/math/math";
import { Utils } from "../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../@types/core/earth_3dtileset";
import { CoordinateOffsetType, ICartesian3Like } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { CoordinateTransform } from "../misc/crs/coordinate_transform";
import { GeographicProjection } from "../projection/geographic_projection";
import { IProjection } from "../projection/projection";

export const gltfUpAxis = Earth3DTilesetGltfUpAxis;

export * from "../projection/web_mercator_projection";
export * from "../cartesian/cartesian3";


class Matrix4 {

    public elements = [];

    public constructor () {

        this.elements = [

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1

        ];

    }

    public set (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {

        const te = this.elements;

        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

        return this;

    }

    public fromArray (array, offset = 0) {

        for (let i = 0; i < 16; i++) {

            this.elements[i] = array[i + offset];

        }

        return this;

    }


    public makeTranslation (x, y, z) {

        this.set(

            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1

        );

        return this;

    }

    multiply (m) {

        return this.multiplyMatrices(this, m);

    }

    premultiply (m) {

        return this.multiplyMatrices(m, this);

    }

    multiplyMatrices (a, b) {

        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;

    }

    public getTranslation (result: Cartesian3) {
        result.x = this.elements[12];
        result.y = this.elements[13];
        result.z = this.elements[14];
        return result;
    }

}

let scratchMat4 = new Matrix4();
let scratchCartesian3 = new Cartesian3();
let geographicProjection = new GeographicProjection();
let scratchCartographic = new Cartographic();
let scratchFirstCartesian = new Cartesian3();
let scratchSecondCartesian = new Cartesian3();


/**
 * 在worker中运行的transform
 */
export class WorkerTransform {

    /**
    * 投影rtc cartesian 到 投影坐标系
    */
    public static projectRtcCartesian3 (projection: IProjection, coordinateOffsetType: CoordinateOffsetType, transform: Matrix4, cartesian: ICartesian3Like, out: Cartesian3) {
        let pos_mat4 = scratchMat4.makeTranslation(cartesian.x, cartesian.y, cartesian.z);
        pos_mat4.premultiply(transform);
        let rtcCenter = transform.getTranslation(scratchCartesian3);
        let center_cartographic_84 = geographicProjection.ellipsoid.cartesianToCartographic(rtcCenter, scratchCartographic);
        this.transformWGS84Coordinate(center_cartographic_84, coordinateOffsetType, center_cartographic_84);
        let projected_center = projection.project(center_cartographic_84!, scratchFirstCartesian);
        let pos_84 = pos_mat4.getTranslation(scratchCartesian3);
        let pos_cartographic_84 = geographicProjection.ellipsoid.cartesianToCartographic(pos_84, scratchCartographic);
        this.transformWGS84Coordinate(pos_cartographic_84, coordinateOffsetType, pos_cartographic_84);
        let projected_pos = projection.project(pos_cartographic_84!, scratchSecondCartesian);
        return Cartesian3.subtract(out, projected_pos, projected_center);
    }

    /**
     * 转换WGS84坐标
     * @param cartographic 
     * @param coordinateOffsetType 
     * @param out
     */
    public static transformWGS84Coordinate (cartographic: Cartographic, coordinateOffsetType: CoordinateOffsetType, out?: Cartographic) {
        if (coordinateOffsetType === CoordinateOffsetType.NONE) return cartographic;
        let lng = math.toDegree(cartographic.longitude);
        let lat = math.toDegree(cartographic.latitude);
        out = Utils.defined(out) ? out! : new Cartographic();
        let resLng: number;
        let resLat: number;
        if (coordinateOffsetType === CoordinateOffsetType.GCJ02) {
            let res = CoordinateTransform.wgs84togcj02(lng, lat);
            resLng = res[0];
            resLat = res[1];
        } else if (coordinateOffsetType === CoordinateOffsetType.BD09) {
            let res = CoordinateTransform.wgs84tobd09(lng, lat);
            resLng = res[0];
            resLat = res[1];
        }
        out.longitude = math.toRadian(resLng);
        out.latitude = math.toRadian(resLat);
        out.height = cartographic.height;
        return out;
    }


}