import { Matrix3 } from "three";
import { Utils } from "../../core/utils/utils";
import { ICartesian3Like } from "../@types/core/gis";

export class Matrix3Utils {
    public static multiplyByScale (mat3: Matrix3, scale: ICartesian3Like, out: Matrix3) {
        out.elements[0] = mat3.elements[0] * scale.x;
        out.elements[1] = mat3.elements[1] * scale.x;
        out.elements[2] = mat3.elements[2] * scale.x;
        out.elements[3] = mat3.elements[3] * scale.y;
        out.elements[4] = mat3.elements[4] * scale.y;
        out.elements[5] = mat3.elements[5] * scale.y;
        out.elements[6] = mat3.elements[6] * scale.z;
        out.elements[7] = mat3.elements[7] * scale.z;
        out.elements[8] = mat3.elements[8] * scale.z;
    }

    public static fromRotationX (angle: number, result?: Matrix3) {
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);

        if (!Utils.defined(result)) {
            return new Matrix3(
            ).set(
                1.0,
                0.0,
                0.0,
                0.0,
                cosAngle,
                -sinAngle,
                0.0,
                sinAngle,
                cosAngle
            );
        }

        result!.elements[0] = 1.0;
        result!.elements[1] = 0.0;
        result!.elements[2] = 0.0;
        result!.elements[3] = 0.0;
        result!.elements[4] = cosAngle;
        result!.elements[5] = sinAngle;
        result!.elements[6] = 0.0;
        result!.elements[7] = -sinAngle;
        result!.elements[8] = cosAngle;

        return result!;
    }

}