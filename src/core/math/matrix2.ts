import { Cartesian2 } from "../../gis";
import { ICartesian2Like } from "../../gis/@types/core/gis";
import { Utils } from "../utils/utils";

const scaleScratch1 = new Cartesian2();
const scaleScratch2 = new Cartesian2();
const scaleScratch3 = new Cartesian2();
const scaleScratch4 = new Cartesian2();
const scaleScratch5 = new Cartesian2();
const scratchColumn = new Cartesian2();

export class Matrix2 {

    public readonly elements: number[] = [];

    public readonly packedLength = 4;

    public get length () {
        return this.packedLength;
    }

    public constructor (column0Row0: number = 0.0, column1Row0: number = 0.0, column0Row1: number = 0.0, column1Row1: number = 0.0) {
        this.elements[0] = column0Row0;
        this.elements[1] = column0Row1;
        this.elements[2] = column1Row0;
        this.elements[3] = column1Row1;
    }

    public clone (result?: Matrix2) {
        return Matrix2.clone(this, result);
    }

    public equals (right: Matrix2) {
        return Matrix2.equals(this, right);
    }

    public equalsEpsilon (right: Matrix2, epsilon?: number) {
        return Matrix2.equalsEpsilon(this, right, epsilon);
    }

    public toString () {
        return `(${this.elements[0]}, ${this.elements[2]})\n` + `(${this.elements[1]}, ${this.elements[3]})`;
    }

    public static pack (value: Matrix2, array: number[], startingIndex: number) {
        startingIndex = Utils.defaultValue(startingIndex, 0);

        array[startingIndex++] = value.elements[0];
        array[startingIndex++] = value.elements[1];
        array[startingIndex++] = value.elements[2];
        array[startingIndex++] = value.elements[3];

        return array;
    }

    public static unpack (array: number[], startingIndex: number, result?: Matrix2) {

        startingIndex = Utils.defaultValue(startingIndex, 0);

        if (!Utils.defined(result)) {
            result = new Matrix2();
        }

        result.elements[0] = array[startingIndex++];
        result.elements[1] = array[startingIndex++];
        result.elements[2] = array[startingIndex++];
        result.elements[3] = array[startingIndex++];
        return result;
    }

    public static packArray (array: Matrix2[], result: number[]) {
        const length = array.length;
        const resultLength = length * 4;
        if (!Utils.defined(result)) {
            result = new Array(resultLength);
        } else if (!Array.isArray(result) || result.length !== resultLength) {
            throw new Error(
                "If result is a typed array, it must have exactly array.length * 4 elements"
            );
        } else if (result.length !== resultLength) {
            result.length = resultLength;
        }

        for (let i = 0; i < length; ++i) {
            Matrix2.pack(array[i], result, i * 4);
        }
        return result;
    }

    public static unpackArray (array: number[], result: Matrix2[]) {
        if (array.length % 4 !== 0) {
            throw new Error("array length must be a multiple of 4.");
        }

        const length = array.length;
        if (!Utils.defined(result)) {
            result = new Array(length / 4);
        } else {
            result.length = length / 4;
        }

        for (let i = 0; i < length; i += 4) {
            const index = i / 4;
            result[index] = Matrix2.unpack(array, i, result[index]);
        }
        return result;
    }

    public static clone (matrix: Matrix2, result?: Matrix2) {
        if (!Utils.defined(matrix)) {
            return undefined;
        }
        if (!Utils.defined(result)) {
            return new Matrix2(matrix.elements[0], matrix.elements[2], matrix.elements[1], matrix.elements[3]);
        }
        result.elements[0] = matrix.elements[0];
        result.elements[1] = matrix.elements[1];
        result.elements[2] = matrix.elements[2];
        result.elements[3] = matrix.elements[3];
        return result;
    }

    public static fromArray = this.unpack;

    public static fromColumnMajorArray (values: number[], result?: Matrix2) {
        return Matrix2.fromArray(values, 0, result);
    }

    public static fromRowMajorArray (values: number[], result?: Matrix2) {
        if (!Utils.defined(result)) {
            return new Matrix2(values[0], values[1], values[2], values[3]);
        }
        result.elements[0] = values[0];
        result.elements[1] = values[2];
        result.elements[2] = values[1];
        result.elements[3] = values[3];
        return result;
    }

    public static fromScale (scale: ICartesian2Like, result?: Matrix2) {
        if (!Utils.defined(result)) {
            return new Matrix2(scale.x, 0.0, 0.0, scale.y);
        }

        result.elements[0] = scale.x;
        result.elements[1] = 0.0;
        result.elements[2] = 0.0;
        result.elements[3] = scale.y;
        return result;
    }

    public static fromUniformScale (scale: number, result?: Matrix2) {
        if (!Utils.defined(result)) {
            return new Matrix2(scale, 0.0, 0.0, scale);
        }

        result.elements[0] = scale;
        result.elements[1] = 0.0;
        result.elements[2] = 0.0;
        result.elements[3] = scale;
        return result;
    }

    public static fromRotation (angle: number, result?: Matrix2) {

        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        if (!Utils.defined(result)) {
            return new Matrix2(cosAngle, -sinAngle, sinAngle, cosAngle);
        }
        result.elements[0] = cosAngle;
        result.elements[1] = sinAngle;
        result.elements[2] = -sinAngle;
        result.elements[3] = cosAngle;
        return result;
    }

    public static toArray (matrix: Matrix2, result?: number[]) {
        if (!Utils.defined(result)) {
            return [matrix.elements[0], matrix.elements[1], matrix.elements[2], matrix.elements[3]];
        }
        result[0] = matrix.elements[0];
        result[1] = matrix.elements[1];
        result[2] = matrix.elements[2];
        result[3] = matrix.elements[3];
        return result;
    }

    public static getElementIndex (column: number, row: number) {
        return column * 2 + row;
    }

    public static getColumn (matrix: Matrix2, index: number, result: ICartesian2Like) {
        const startIndex = index * 2;
        const x = matrix.elements[startIndex];
        const y = matrix.elements[startIndex + 1];

        result.x = x;
        result.y = y;
        return result;
    }

    public static setColumn (matrix: Matrix2, index: number, cartesian: ICartesian2Like, result?: Matrix2) {
        result = Matrix2.clone(matrix, result);
        const startIndex = index * 2;
        result.elements[startIndex] = cartesian.x;
        result.elements[startIndex + 1] = cartesian.y;
        return result;
    }

    public static getRow (matrix: Matrix2, index: number, result: ICartesian2Like) {
        const x = matrix.elements[index];
        const y = matrix.elements[index + 2];

        result.x = x;
        result.y = y;
        return result;
    }

    public static setRow (matrix: Matrix2, index: number, cartesian: ICartesian2Like, result?: Matrix2) {
        result = Matrix2.clone(matrix, result);
        result.elements[index] = cartesian.x;
        result.elements[index + 2] = cartesian.y;
        return result;
    }

    public static setScale (matrix: Matrix2, scale: ICartesian2Like, result?: Matrix2) {
        const existingScale = this.getScale(matrix, scaleScratch1);
        const scaleRatioX = scale.x / existingScale.x;
        const scaleRatioY = scale.y / existingScale.y;

        result.elements[0] = matrix.elements[0] * scaleRatioX;
        result.elements[1] = matrix.elements[1] * scaleRatioX;
        result.elements[2] = matrix.elements[2] * scaleRatioY;
        result.elements[3] = matrix.elements[3] * scaleRatioY;

        return result;
    }

    public static setUniformScale (matrix: Matrix2, scale: number, result?: Matrix2) {
        const existingScale = Matrix2.getScale(matrix, scaleScratch2);
        const scaleRatioX = scale / existingScale.x;
        const scaleRatioY = scale / existingScale.y;

        result.elements[0] = matrix.elements[0] * scaleRatioX;
        result.elements[1] = matrix.elements[1] * scaleRatioX;
        result.elements[2] = matrix.elements[2] * scaleRatioY;
        result.elements[3] = matrix.elements[3] * scaleRatioY;

        return result;
    }

    public static getScale (matrix: Matrix2, result: ICartesian2Like) {
        result.x = Cartesian2.magnitude(
            Cartesian2.fromElements(matrix.elements[0], matrix.elements[1], scratchColumn)
        );
        result.y = Cartesian2.magnitude(
            Cartesian2.fromElements(matrix.elements[2], matrix.elements[3], scratchColumn)
        );
        return result;
    }

    public static getMaximumScale (matrix: Matrix2) {
        Matrix2.getScale(matrix, scaleScratch3);
        return Cartesian2.maximumComponent(scaleScratch3);
    }

    public static setRotation (matrix: Matrix2, rotation: Matrix2, result: Matrix2) {
        const scale = Matrix2.getScale(matrix, scaleScratch4);

        result.elements[0] = rotation.elements[0] * scale.x;
        result.elements[1] = rotation.elements[1] * scale.x;
        result.elements[2] = rotation.elements[2] * scale.y;
        result.elements[3] = rotation.elements[3] * scale.y;

        return result;
    }

    public static getRotation (matrix: Matrix2, result: Matrix2) {
        const scale = Matrix2.getScale(matrix, scaleScratch5);

        result.elements[0] = matrix.elements[0] / scale.x;
        result.elements[1] = matrix.elements[1] / scale.x;
        result.elements[2] = matrix.elements[2] / scale.y;
        result.elements[3] = matrix.elements[3] / scale.y;

        return result;
    }

    public static multiply (left: Matrix2, right: Matrix2, result: Matrix2) {
        const column0Row0 = left.elements[0] * right.elements[0] + left.elements[2] * right.elements[1];
        const column1Row0 = left.elements[0] * right.elements[2] + left.elements[2] * right.elements[3];
        const column0Row1 = left.elements[1] * right.elements[0] + left.elements[3] * right.elements[1];
        const column1Row1 = left.elements[1] * right.elements[2] + left.elements[3] * right.elements[3];

        result.elements[0] = column0Row0;
        result.elements[1] = column0Row1;
        result.elements[2] = column1Row0;
        result.elements[3] = column1Row1;
        return result;
    }

    public static add (left: Matrix2, right: Matrix2, result: Matrix2) {

        result.elements[0] = left.elements[0] + right.elements[0];
        result.elements[1] = left.elements[1] + right.elements[1];
        result.elements[2] = left.elements[2] + right.elements[2];
        result.elements[3] = left.elements[3] + right.elements[3];
        return result;
    }

    public static subtract (left: Matrix2, right: Matrix2, result: Matrix2) {
        result.elements[0] = left.elements[0] - right.elements[0];
        result.elements[1] = left.elements[1] - right.elements[1];
        result.elements[2] = left.elements[2] - right.elements[2];
        result.elements[3] = left.elements[3] - right.elements[3];
        return result;
    }

    public static multiplyByVector (matrix: Matrix2, cartesian: ICartesian2Like, result: ICartesian2Like) {
        const x = matrix.elements[0] * cartesian.x + matrix.elements[2] * cartesian.y;
        const y = matrix.elements[1] * cartesian.x + matrix.elements[3] * cartesian.y;

        result.x = x;
        result.y = y;
        return result;
    }

    public static multiplyByScalar (matrix: Matrix2, scalar: number, result: Matrix2) {
        result.elements[0] = matrix.elements[0] * scalar;
        result.elements[1] = matrix.elements[1] * scalar;
        result.elements[2] = matrix.elements[2] * scalar;
        result.elements[3] = matrix.elements[3] * scalar;
        return result;
    }

    public static multiplyByScale (matrix: Matrix2, scale: ICartesian2Like, result: Matrix2) {

        result.elements[0] = matrix.elements[0] * scale.x;
        result.elements[1] = matrix.elements[1] * scale.x;
        result.elements[2] = matrix.elements[2] * scale.y;
        result.elements[3] = matrix.elements[3] * scale.y;

        return result;
    }

    public static multiplyByUniformScale (matrix: Matrix2, scale: number, result: Matrix2) {
        result.elements[0] = matrix.elements[0] * scale;
        result.elements[1] = matrix.elements[1] * scale;
        result.elements[2] = matrix.elements[2] * scale;
        result.elements[3] = matrix.elements[3] * scale;

        return result;
    }

    public static negate (matrix: Matrix2, result: Matrix2) {

        result.elements[0] = -matrix.elements[0];
        result.elements[1] = -matrix.elements[1];
        result.elements[2] = -matrix.elements[2];
        result.elements[3] = -matrix.elements[3];
        return result;
    }

    public static transpose (matrix: Matrix2, result: Matrix2) {
        const column0Row0 = matrix.elements[0];
        const column0Row1 = matrix.elements[2];
        const column1Row0 = matrix.elements[1];
        const column1Row1 = matrix.elements[3];

        result.elements[0] = column0Row0;
        result.elements[1] = column0Row1;
        result.elements[2] = column1Row0;
        result.elements[3] = column1Row1;
        return result;
    }

    public static abs (matrix: Matrix2, result: Matrix2) {
        result.elements[0] = Math.abs(matrix.elements[0]);
        result.elements[1] = Math.abs(matrix.elements[1]);
        result.elements[2] = Math.abs(matrix.elements[2]);
        result.elements[3] = Math.abs(matrix.elements[3]);

        return result;
    }

    public static equals (left: Matrix2, right: Matrix2) {
        return (
            left === right ||
            (Utils.defined(left) &&
                Utils.defined(right) &&
                left.elements[0] === right.elements[0] &&
                left.elements[1] === right.elements[1] &&
                left.elements[2] === right.elements[2] &&
                left.elements[3] === right.elements[3])
        );
    }

    public static equalsArray (matrix: Matrix2, array: number[], offset: number) {
        return (
            matrix.elements[0] === array[offset] &&
            matrix.elements[1] === array[offset + 1] &&
            matrix.elements[2] === array[offset + 2] &&
            matrix.elements[3] === array[offset + 3]
        );
    }

    public static equalsEpsilon (left: Matrix2, right: Matrix2, epsilon?: number) {
        epsilon = Utils.defaultValue(epsilon, 0);
        return (
            left === right ||
            (Utils.defined(left) &&
                Utils.defined(right) &&
                Math.abs(left.elements[0] - right.elements[0]) <= epsilon &&
                Math.abs(left.elements[1] - right.elements[1]) <= epsilon &&
                Math.abs(left.elements[2] - right.elements[2]) <= epsilon &&
                Math.abs(left.elements[3] - right.elements[3]) <= epsilon)
        );
    }

    public static IDENTITY = Object.freeze(new Matrix2(1.0, 0.0, 0.0, 1.0))

    public static ZERO = Object.freeze(new Matrix2(0.0, 0.0, 0.0, 0.0))

    public static COLUMN0ROW0 = 0;

    public static COLUMN0ROW1 = 1;

    public static COLUMN1ROW0 = 2;

    public static COLUMN1ROW1 = 3;

}