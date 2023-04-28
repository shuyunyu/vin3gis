import { Matrix3, Matrix4 } from "three";
import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartesian4 } from "../cartesian/cartesian4";
import { Matrix2 } from "../../../core/math/matrix2";

/**
 * An enum describing the attribute type for glTF and 3D Tiles.
 *
 * @enum {string}
 *
 * @private
 */
export const AttributeType = Object.freeze({
    /**
     * The attribute is a single component.
     *
     * @type {string}
     * @constant
     */
    SCALAR: "SCALAR",

    /**
     * The attribute is a two-component vector.
     *
     * @type {string}
     * @constant
     */
    VEC2: "VEC2",

    /**
     * The attribute is a three-component vector.
     *
     * @type {string}
     * @constant
     */
    VEC3: "VEC3",

    /**
     * The attribute is a four-component vector.
     *
     * @type {string}
     * @constant
     */
    VEC4: "VEC4",

    /**
     * The attribute is a 2x2 matrix.
     *
     * @type {string}
     * @constant
     */
    MAT2: "MAT2",

    /**
     * The attribute is a 3x3 matrix.
     *
     * @type {string}
     * @constant
     */
    MAT3: "MAT3",

    /**
     * The attribute is a 4x4 matrix.
     *
     * @type {string}
     * @constant
     */
    MAT4: "MAT4",

    /**
     * Gets the scalar, vector, or matrix type for the attribute type.
     *
     * @param {AttributeType} attributeType The attribute type.
     * @returns {*} The math type.
     **/

    getMathType: (attributeType: string) => {
        switch (attributeType) {
            case AttributeType.SCALAR:
                return Number;
            case AttributeType.VEC2:
                return Cartesian2;
            case AttributeType.VEC3:
                return Cartesian3;
            case AttributeType.VEC4:
                return Cartesian4;
            case AttributeType.MAT2:
                return Matrix2;
            case AttributeType.MAT3:
                return Matrix3;
            case AttributeType.MAT4:
                return Matrix4;
            default:
                throw new Error("attributeType is not a valid value.");
        }
    },

    /**
     * Gets the number of components per attribute.
     *
     * @param {AttributeType} attributeType The attribute type.
     * @returns {number} The number of components.
     *
     */
    etNumberOfComponents: (attributeType: string) => {
        switch (attributeType) {
            case AttributeType.SCALAR:
                return 1;
            case AttributeType.VEC2:
                return 2;
            case AttributeType.VEC3:
                return 3;
            case AttributeType.VEC4:
            case AttributeType.MAT2:
                return 4;
            case AttributeType.MAT3:
                return 9;
            case AttributeType.MAT4:
                return 16;
            default:
                throw new Error("attributeType is not a valid value.");
        }
    },

    /**
     * Get the number of attribute locations needed to fit this attribute. Most
     * types require one, but matrices require multiple attribute locations.
     *
     * @param {AttributeType} attributeType The attribute type.
     * @returns {number} The number of attribute locations needed in the shader
     *
     */
    getAttributeLocationCount: (attributeType: string) => {
        switch (attributeType) {
            case AttributeType.SCALAR:
            case AttributeType.VEC2:
            case AttributeType.VEC3:
            case AttributeType.VEC4:
                return 1;
            case AttributeType.MAT2:
                return 2;
            case AttributeType.MAT3:
                return 3;
            case AttributeType.MAT4:
                return 4;
            default:
                throw new Error("attributeType is not a valid value.");
        }
    },

    /**
     * Gets the GLSL type for the attribute type.
     *
     * @param {AttributeType} attributeType The attribute type.
     * @returns {string} The GLSL type for the attribute type.
     *
     */
    getGlslType: (attributeType: string) => {
        switch (attributeType) {
            case AttributeType.SCALAR:
                return "float";
            case AttributeType.VEC2:
                return "vec2";
            case AttributeType.VEC3:
                return "vec3";
            case AttributeType.VEC4:
                return "vec4";
            case AttributeType.MAT2:
                return "mat2";
            case AttributeType.MAT3:
                return "mat3";
            case AttributeType.MAT4:
                return "mat4";
            default:
                throw new Error("attributeType is not a valid value.");
        }
    }

})
