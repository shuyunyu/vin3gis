import { Matrix4 } from "three";
import { math } from "../../../core/math/math";
import { Matrix3Utils } from "../../utils/matrix3_utils";
import { Matrix4Utils } from "../../utils/matrix4_utils";

export class Axis {

    public static Z_UP_TO_Y_UP: Matrix4 = Matrix4Utils.fromRotationTranslation(
        Matrix3Utils.fromRotationX(-math.PI_OVER_TWO)
    );

}