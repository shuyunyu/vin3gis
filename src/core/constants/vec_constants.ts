import { Vector2, Vector3 } from "three";

/**
 * 矢量常量
 */
export class VecConstants {

    public static ZERO_VEC2 = Object.freeze(new Vector2(0.0, 0.0));

    public static ZERO_VEC3 = Object.freeze(new Vector3(0.0, 0.0, 0.0));

    public static UNIT_X_VEC3 = Object.freeze(new Vector3(1.0, 0.0, 0.0));

    public static UNIT_Y_VEC3 = Object.freeze(new Vector3(0.0, 1.0, 0.0));

    public static UNIT_Z_VEC3 = Object.freeze(new Vector3(0.0, 0.0, 1.0));

}