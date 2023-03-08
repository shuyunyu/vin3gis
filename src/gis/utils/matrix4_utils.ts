import { Matrix3, Matrix4 } from "three";
import { MatConstants } from "../../core/constants/mat_constants";
import { Utils } from "../../core/utils/utils";
import { ICartesian3Like } from "../@types/core/gis";
import { Cartesian3 } from "../core/cartesian/cartesian3";

const scaleScratch = new Cartesian3();

export class Matrix4Utils {

    public static multiply (left: Matrix4, right: Matrix4, result: Matrix4) {
        let left0 = left.elements[0];
        let left1 = left.elements[1];
        let left2 = left.elements[2];
        let left3 = left.elements[3];
        let left4 = left.elements[4];
        let left5 = left.elements[5];
        let left6 = left.elements[6];
        let left7 = left.elements[7];
        let left8 = left.elements[8];
        let left9 = left.elements[9];
        let left10 = left.elements[10];
        let left11 = left.elements[11];
        let left12 = left.elements[12];
        let left13 = left.elements[13];
        let left14 = left.elements[14];
        let left15 = left.elements[15];

        let right0 = right.elements[0];
        let right1 = right.elements[1];
        let right2 = right.elements[2];
        let right3 = right.elements[3];
        let right4 = right.elements[4];
        let right5 = right.elements[5];
        let right6 = right.elements[6];
        let right7 = right.elements[7];
        let right8 = right.elements[8];
        let right9 = right.elements[9];
        let right10 = right.elements[10];
        let right11 = right.elements[11];
        let right12 = right.elements[12];
        let right13 = right.elements[13];
        let right14 = right.elements[14];
        let right15 = right.elements[15];

        let column0Row0 =
            left0 * right0 + left4 * right1 + left8 * right2 + left12 * right3;
        let column0Row1 =
            left1 * right0 + left5 * right1 + left9 * right2 + left13 * right3;
        let column0Row2 =
            left2 * right0 + left6 * right1 + left10 * right2 + left14 * right3;
        let column0Row3 =
            left3 * right0 + left7 * right1 + left11 * right2 + left15 * right3;

        let column1Row0 =
            left0 * right4 + left4 * right5 + left8 * right6 + left12 * right7;
        let column1Row1 =
            left1 * right4 + left5 * right5 + left9 * right6 + left13 * right7;
        let column1Row2 =
            left2 * right4 + left6 * right5 + left10 * right6 + left14 * right7;
        let column1Row3 =
            left3 * right4 + left7 * right5 + left11 * right6 + left15 * right7;

        let column2Row0 =
            left0 * right8 + left4 * right9 + left8 * right10 + left12 * right11;
        let column2Row1 =
            left1 * right8 + left5 * right9 + left9 * right10 + left13 * right11;
        let column2Row2 =
            left2 * right8 + left6 * right9 + left10 * right10 + left14 * right11;
        let column2Row3 =
            left3 * right8 + left7 * right9 + left11 * right10 + left15 * right11;

        let column3Row0 =
            left0 * right12 + left4 * right13 + left8 * right14 + left12 * right15;
        let column3Row1 =
            left1 * right12 + left5 * right13 + left9 * right14 + left13 * right15;
        let column3Row2 =
            left2 * right12 + left6 * right13 + left10 * right14 + left14 * right15;
        let column3Row3 =
            left3 * right12 + left7 * right13 + left11 * right14 + left15 * right15;

        result.elements[0] = column0Row0;
        result.elements[1] = column0Row1;
        result.elements[2] = column0Row2;
        result.elements[3] = column0Row3;
        result.elements[4] = column1Row0;
        result.elements[5] = column1Row1;
        result.elements[6] = column1Row2;
        result.elements[7] = column1Row3;
        result.elements[8] = column2Row0;
        result.elements[9] = column2Row1;
        result.elements[10] = column2Row2;
        result.elements[11] = column2Row3;
        result.elements[12] = column3Row0;
        result.elements[13] = column3Row1;
        result.elements[14] = column3Row2;
        result.elements[15] = column3Row3;
        return result;
    }

    public static multiplyTransformation (left: Matrix4, right: Matrix4, result: Matrix4) {
        let left0 = left.elements[0];
        let left1 = left.elements[1];
        let left2 = left.elements[2];
        let left4 = left.elements[4];
        let left5 = left.elements[5];
        let left6 = left.elements[6];
        let left8 = left.elements[8];
        let left9 = left.elements[9];
        let left10 = left.elements[10];
        let left12 = left.elements[12];
        let left13 = left.elements[13];
        let left14 = left.elements[14];

        let right0 = right.elements[0];
        let right1 = right.elements[1];
        let right2 = right.elements[2];
        let right4 = right.elements[4];
        let right5 = right.elements[5];
        let right6 = right.elements[6];
        let right8 = right.elements[8];
        let right9 = right.elements[9];
        let right10 = right.elements[10];
        let right12 = right.elements[12];
        let right13 = right.elements[13];
        let right14 = right.elements[14];

        let column0Row0 = left0 * right0 + left4 * right1 + left8 * right2;
        let column0Row1 = left1 * right0 + left5 * right1 + left9 * right2;
        let column0Row2 = left2 * right0 + left6 * right1 + left10 * right2;

        let column1Row0 = left0 * right4 + left4 * right5 + left8 * right6;
        let column1Row1 = left1 * right4 + left5 * right5 + left9 * right6;
        let column1Row2 = left2 * right4 + left6 * right5 + left10 * right6;

        let column2Row0 = left0 * right8 + left4 * right9 + left8 * right10;
        let column2Row1 = left1 * right8 + left5 * right9 + left9 * right10;
        let column2Row2 = left2 * right8 + left6 * right9 + left10 * right10;

        let column3Row0 =
            left0 * right12 + left4 * right13 + left8 * right14 + left12;
        let column3Row1 =
            left1 * right12 + left5 * right13 + left9 * right14 + left13;
        let column3Row2 =
            left2 * right12 + left6 * right13 + left10 * right14 + left14;

        result.elements[0] = column0Row0;
        result.elements[1] = column0Row1;
        result.elements[2] = column0Row2;
        result.elements[3] = 0.0;
        result.elements[4] = column1Row0;
        result.elements[5] = column1Row1;
        result.elements[6] = column1Row2;
        result.elements[7] = 0.0;
        result.elements[8] = column2Row0;
        result.elements[9] = column2Row1;
        result.elements[10] = column2Row2;
        result.elements[11] = 0.0;
        result.elements[12] = column3Row0;
        result.elements[13] = column3Row1;
        result.elements[14] = column3Row2;
        result.elements[15] = 1.0;
        return result;
    }

    public static fromTranslation (translation: Cartesian3, reslult?: Matrix4) {
        return this.fromRotationTranslation(MatConstants.Mat3_IDENTITY, translation, reslult);
    }

    public static fromRotationTranslation (rotation: Matrix3, translation?: Cartesian3, result?: Matrix4) {
        translation = Utils.defaultValue(translation, new Cartesian3());

        if (!Utils.defined(result)) {
            result = new Matrix4();
            result.elements[0] = rotation.elements[0];
            result.elements[1] = rotation.elements[3];
            result.elements[2] = rotation.elements[6];
            result.elements[3] = translation!.x;
            result.elements[4] = rotation.elements[1];
            result.elements[5] = rotation.elements[4];
            result.elements[6] = rotation.elements[7];
            result.elements[7] = translation!.y;
            result.elements[8] = rotation.elements[2];
            result.elements[9] = rotation.elements[5];
            result.elements[10] = rotation.elements[8];
            result.elements[11] = translation!.z;
            result.elements[12] = 0.0;
            result.elements[13] = 0.0;
            result.elements[14] = 0.0;
            result.elements[15] = 1.0;
            return result;
        }

        result.elements[0] = rotation.elements[0];
        result.elements[1] = rotation.elements[1];
        result.elements[2] = rotation.elements[2];
        result.elements[3] = 0.0;
        result.elements[4] = rotation.elements[3];
        result.elements[5] = rotation.elements[4];
        result.elements[6] = rotation.elements[5];
        result.elements[7] = 0.0;
        result.elements[8] = rotation.elements[6];
        result.elements[9] = rotation.elements[7];
        result.elements[10] = rotation.elements[8];
        result.elements[11] = 0.0;
        result.elements[12] = translation!.x;
        result.elements[13] = translation!.y;
        result.elements[14] = translation!.z;
        result.elements[15] = 1.0;
        return result!;
    }

    public static inverseTransformation (matrix: Matrix4, result: Matrix4) {
        let matrix0 = matrix.elements[0];
        let matrix1 = matrix.elements[1];
        let matrix2 = matrix.elements[2];
        let matrix4 = matrix.elements[4];
        let matrix5 = matrix.elements[5];
        let matrix6 = matrix.elements[6];
        let matrix8 = matrix.elements[8];
        let matrix9 = matrix.elements[9];
        let matrix10 = matrix.elements[10];

        let vX = matrix.elements[12];
        let vY = matrix.elements[13];
        let vZ = matrix.elements[14];

        let x = -matrix0 * vX - matrix1 * vY - matrix2 * vZ;
        let y = -matrix4 * vX - matrix5 * vY - matrix6 * vZ;
        let z = -matrix8 * vX - matrix9 * vY - matrix10 * vZ;

        result.elements[0] = matrix0;
        result.elements[1] = matrix4;
        result.elements[2] = matrix8;
        result.elements[3] = 0.0;
        result.elements[4] = matrix1;
        result.elements[5] = matrix5;
        result.elements[6] = matrix9;
        result.elements[7] = 0.0;
        result.elements[8] = matrix2;
        result.elements[9] = matrix6;
        result.elements[10] = matrix10;
        result.elements[11] = 0.0;
        result.elements[12] = x;
        result.elements[13] = y;
        result.elements[14] = z;
        result.elements[15] = 1.0;
        return result;
    }

    public static multiplyByMatrix3 (matrix: Matrix4, rotation: Matrix3, result: Matrix4) {
        let left0 = matrix.elements[0];
        let left1 = matrix.elements[1];
        let left2 = matrix.elements[2];
        let left4 = matrix.elements[4];
        let left5 = matrix.elements[5];
        let left6 = matrix.elements[6];
        let left8 = matrix.elements[8];
        let left9 = matrix.elements[9];
        let left10 = matrix.elements[10];

        let right0 = rotation.elements[0];
        let right1 = rotation.elements[1];
        let right2 = rotation.elements[2];
        let right4 = rotation.elements[3];
        let right5 = rotation.elements[4];
        let right6 = rotation.elements[5];
        let right8 = rotation.elements[6];
        let right9 = rotation.elements[7];
        let right10 = rotation.elements[8];

        let column0Row0 = left0 * right0 + left4 * right1 + left8 * right2;
        let column0Row1 = left1 * right0 + left5 * right1 + left9 * right2;
        let column0Row2 = left2 * right0 + left6 * right1 + left10 * right2;

        let column1Row0 = left0 * right4 + left4 * right5 + left8 * right6;
        let column1Row1 = left1 * right4 + left5 * right5 + left9 * right6;
        let column1Row2 = left2 * right4 + left6 * right5 + left10 * right6;

        let column2Row0 = left0 * right8 + left4 * right9 + left8 * right10;
        let column2Row1 = left1 * right8 + left5 * right9 + left9 * right10;
        let column2Row2 = left2 * right8 + left6 * right9 + left10 * right10;

        result.elements[0] = column0Row0;
        result.elements[1] = column0Row1;
        result.elements[2] = column0Row2;
        result.elements[3] = 0.0;
        result.elements[4] = column1Row0;
        result.elements[5] = column1Row1;
        result.elements[6] = column1Row2;
        result.elements[7] = 0.0;
        result.elements[8] = column2Row0;
        result.elements[9] = column2Row1;
        result.elements[10] = column2Row2;
        result.elements[11] = 0.0;
        result.elements[12] = matrix.elements[12];
        result.elements[13] = matrix.elements[13];
        result.elements[14] = matrix.elements[14];
        result.elements[15] = matrix.elements[15];
        return result;
    }

    public static setTranslation (matrix: Matrix4, translation: ICartesian3Like, result: Matrix4) {
        result.elements[0] = matrix.elements[0]
        result.elements[1] = matrix.elements[1]
        result.elements[2] = matrix.elements[2]
        result.elements[3] = matrix.elements[3]
        result.elements[4] = matrix.elements[4]
        result.elements[5] = matrix.elements[5]
        result.elements[6] = matrix.elements[6]
        result.elements[7] = matrix.elements[7]
        result.elements[8] = matrix.elements[8]
        result.elements[9] = matrix.elements[9]
        result.elements[10] = matrix.elements[10];
        result.elements[11] = matrix.elements[11];
        result.elements[12] = translation.x;
        result.elements[13] = translation.y;
        result.elements[14] = translation.z;
        result.elements[15] = matrix.elements[15];

        return result;
    }

    public static multiplyByPoint (matrix: Matrix4, cartesian: Cartesian3, result: Cartesian3) {
        let vX = cartesian.x;
        let vY = cartesian.y;
        let vZ = cartesian.z;

        let x = matrix.elements[0] * vX + matrix.elements[4] * vY + matrix.elements[8] * vZ + matrix.elements[12];
        let y = matrix.elements[1] * vX + matrix.elements[5] * vY + matrix.elements[9] * vZ + matrix.elements[13];
        let z = matrix.elements[2] * vX + matrix.elements[6] * vY + matrix.elements[10] * vZ + matrix.elements[14];

        result.x = x;
        result.y = y;
        result.z = z;
        return result;
    }

    public static getMatrix3 (matrix: Matrix4, result: Matrix3) {
        result.elements[0] = matrix.elements[0];
        result.elements[1] = matrix.elements[1];
        result.elements[2] = matrix.elements[2];
        result.elements[3] = matrix.elements[4];
        result.elements[4] = matrix.elements[5];
        result.elements[5] = matrix.elements[6];
        result.elements[6] = matrix.elements[8];
        result.elements[7] = matrix.elements[9];
        result.elements[8] = matrix.elements[10];
        return result;
    }

    public static getScale (matrix: Matrix4, result: Cartesian3) {
        result.x = Cartesian3.len(new Cartesian3(matrix.elements[0], matrix.elements[1], matrix.elements[2]));
        result.y = Cartesian3.len(new Cartesian3(matrix.elements[4], matrix.elements[5], matrix.elements[6]));
        result.z = Cartesian3.len(new Cartesian3(matrix.elements[8], matrix.elements[9], matrix.elements[10]));
        return result;
    }

    public static getTranslation (matrix: Matrix4, result: Cartesian3) {
        result.x = matrix.elements[12];
        result.y = matrix.elements[13];
        result.z = matrix.elements[14];
        return result;
    }

    public static clone (matrix: Matrix4, result?: Matrix4) {
        if (!Utils.defined(matrix)) {
            return undefined;
        }
        if (!Utils.defined(result)) {
            return matrix.clone();
        }
        result.copy(matrix);
        return result;
    }


    public static multiplyByScale (matrix: Matrix4, scale: Cartesian3, result: Matrix4) {
        let scaleX = scale.x;
        let scaleY = scale.y;
        let scaleZ = scale.z;

        // Faster than Cartesian3.equals
        if (scaleX === 1.0 && scaleY === 1.0 && scaleZ === 1.0) {
            return this.clone(matrix, result);
        }

        result.elements[0] = scaleX * matrix.elements[0];
        result.elements[1] = scaleX * matrix.elements[1];
        result.elements[2] = scaleX * matrix.elements[2];
        result.elements[3] = 0.0;
        result.elements[4] = scaleY * matrix.elements[4];
        result.elements[5] = scaleY * matrix.elements[5];
        result.elements[6] = scaleY * matrix.elements[6];
        result.elements[7] = 0.0;
        result.elements[8] = scaleZ * matrix.elements[8];
        result.elements[9] = scaleZ * matrix.elements[9];
        result.elements[10] = scaleZ * matrix.elements[10];
        result.elements[11] = 0.0;
        result.elements[12] = matrix.elements[12];
        result.elements[13] = matrix.elements[13];
        result.elements[14] = matrix.elements[14];
        result.elements[15] = 1.0;
        return result;
    }

    public static setScale (matrix: Matrix4, scale: Cartesian3, result: Matrix4) {
        let existingScale = this.getScale(matrix, scaleScratch);
        let newScale = Cartesian3.divideComponents(
            scale,
            existingScale,
            scaleScratch
        );
        return this.multiplyByScale(matrix, newScale, result);
    }

    public static multiplyByTranslation (matrix: Matrix4, translation: Cartesian3, result: Matrix4) {
        var x = translation.x;
        var y = translation.y;
        var z = translation.z;

        var tx = x * matrix.elements[0] + y * matrix.elements[4] + z * matrix.elements[8] + matrix.elements[12];
        var ty = x * matrix.elements[1] + y * matrix.elements[5] + z * matrix.elements[9] + matrix.elements[13];
        var tz = x * matrix.elements[2] + y * matrix.elements[6] + z * matrix.elements[10] + matrix.elements[14];

        result.elements[0] = matrix.elements[0]
        result.elements[1] = matrix.elements[1]
        result.elements[2] = matrix.elements[2]
        result.elements[3] = matrix.elements[3]
        result.elements[4] = matrix.elements[4]
        result.elements[5] = matrix.elements[5]
        result.elements[6] = matrix.elements[6]
        result.elements[7] = matrix.elements[7]
        result.elements[8] = matrix.elements[8]
        result.elements[9] = matrix.elements[9]
        result.elements[10] = matrix.elements[10];
        result.elements[11] = matrix.elements[11];
        result.elements[12] = tx;
        result.elements[13] = ty;
        result.elements[14] = tz;
        result.elements[15] = matrix.elements[15];
        return result;
    };

}
