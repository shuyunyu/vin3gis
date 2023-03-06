import { Utils } from "../../../core/utils/utils";
import { WebGLConstants } from "./webgl_constants";

export class ComponentDatatype {

    /**
   * 8-bit signed byte corresponding to <code>gl.BYTE</code> and the type
   * of an element in <code>Int8Array</code>.
   *
   * @type {Number}
   * @constant
   */
    public static BYTE: number = WebGLConstants.BYTE;

    /**
     * 8-bit unsigned byte corresponding to <code>UNSIGNED_BYTE</code> and the type
     * of an element in <code>Uint8Array</code>.
     *
     * @type {Number}
     * @constant
     */
    public static UNSIGNED_BYTE: number = WebGLConstants.UNSIGNED_BYTE;

    /**
     * 16-bit signed short corresponding to <code>SHORT</code> and the type
     * of an element in <code>Int16Array</code>.
     *
     * @type {Number}
     * @constant
     */
    public static SHORT: number = WebGLConstants.SHORT;

    /**
     * 16-bit unsigned short corresponding to <code>UNSIGNED_SHORT</code> and the type
     * of an element in <code>Uint16Array</code>.
     *
     * @type {Number}
     * @constant
     */
    public static UNSIGNED_SHORT: number = WebGLConstants.UNSIGNED_SHORT;

    /**
     * 32-bit signed int corresponding to <code>INT</code> and the type
     * of an element in <code>Int32Array</code>.
     *
     * @memberOf ComponentDatatype
     *
     * @type {Number}
     * @constant
     */
    public static INT: number = WebGLConstants.INT;

    /**
     * 32-bit unsigned int corresponding to <code>UNSIGNED_INT</code> and the type
     * of an element in <code>Uint32Array</code>.
     *
     * @memberOf ComponentDatatype
     *
     * @type {Number}
     * @constant
     */
    public static UNSIGNED_INT: number = WebGLConstants.UNSIGNED_INT;

    /**
     * 32-bit floating-point corresponding to <code>FLOAT</code> and the type
     * of an element in <code>Float32Array</code>.
     *
     * @type {Number}
     * @constant
     */
    public static FLOAT: number = WebGLConstants.FLOAT;

    /**
     * 64-bit floating-point corresponding to <code>gl.DOUBLE</code> (in Desktop OpenGL;
     * this is not supported in WebGL, and is emulated in Cesium via {@link GeometryPipeline.encodeAttribute})
     * and the type of an element in <code>Float64Array</code>.
     *
     * @memberOf ComponentDatatype
     *
     * @type {Number}
     * @constant
     * @default 0x140A
     */
    public static DOUBLE: number = WebGLConstants.DOUBLE;

    public static getSizeInBytes (componentDatatype: number) {
        switch (componentDatatype) {
            case ComponentDatatype.BYTE:
                return Int8Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_BYTE:
                return Uint8Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.SHORT:
                return Int16Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_SHORT:
                return Uint16Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.INT:
                return Int32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.UNSIGNED_INT:
                return Uint32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.FLOAT:
                return Float32Array.BYTES_PER_ELEMENT;
            case ComponentDatatype.DOUBLE:
                return Float64Array.BYTES_PER_ELEMENT;
            //>>includeStart('debug', pragmas.debug);
            default:
                throw new Error("componentDatatype is not a valid value.");
        }
    }

    public static fromTypedArray (array: any) {
        if (array instanceof Int8Array) {
            return ComponentDatatype.BYTE;
        }
        if (array instanceof Uint8Array) {
            return ComponentDatatype.UNSIGNED_BYTE;
        }
        if (array instanceof Int16Array) {
            return ComponentDatatype.SHORT;
        }
        if (array instanceof Uint16Array) {
            return ComponentDatatype.UNSIGNED_SHORT;
        }
        if (array instanceof Int32Array) {
            return ComponentDatatype.INT;
        }
        if (array instanceof Uint32Array) {
            return ComponentDatatype.UNSIGNED_INT;
        }
        if (array instanceof Float32Array) {
            return ComponentDatatype.FLOAT;
        }
        if (array instanceof Float64Array) {
            return ComponentDatatype.DOUBLE;
        }
    }

    public static validate (componentDatatype: number) {
        return (
            Utils.defined(componentDatatype) &&
            (componentDatatype === ComponentDatatype.BYTE ||
                componentDatatype === ComponentDatatype.UNSIGNED_BYTE ||
                componentDatatype === ComponentDatatype.SHORT ||
                componentDatatype === ComponentDatatype.UNSIGNED_SHORT ||
                componentDatatype === ComponentDatatype.INT ||
                componentDatatype === ComponentDatatype.UNSIGNED_INT ||
                componentDatatype === ComponentDatatype.FLOAT ||
                componentDatatype === ComponentDatatype.DOUBLE)
        );
    }

    public static createTypedArray (componentDatatype: number, valuesOrLength: any) {
        switch (componentDatatype) {
            case ComponentDatatype.BYTE:
                return new Int8Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_BYTE:
                return new Uint8Array(valuesOrLength);
            case ComponentDatatype.SHORT:
                return new Int16Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_SHORT:
                return new Uint16Array(valuesOrLength);
            case ComponentDatatype.INT:
                return new Int32Array(valuesOrLength);
            case ComponentDatatype.UNSIGNED_INT:
                return new Uint32Array(valuesOrLength);
            case ComponentDatatype.FLOAT:
                return new Float32Array(valuesOrLength);
            case ComponentDatatype.DOUBLE:
                return new Float64Array(valuesOrLength);
            //>>includeStart('debug', pragmas.debug);
            default:
                throw new Error("componentDatatype is not a valid value.");
            //>>includeEnd('debug');
        }
    }

    public static createArrayBufferView (componentDatatype: number, buffer: ArrayBuffer, byteOffset: number, length: number) {
        byteOffset = Utils.defaultValue(byteOffset, 0);
        length = Utils.defaultValue(
            length,
            (buffer.byteLength - byteOffset) /
            ComponentDatatype.getSizeInBytes(componentDatatype)
        );

        switch (componentDatatype) {
            case ComponentDatatype.BYTE:
                return new Int8Array(buffer, byteOffset, length);
            case ComponentDatatype.UNSIGNED_BYTE:
                return new Uint8Array(buffer, byteOffset, length);
            case ComponentDatatype.SHORT:
                return new Int16Array(buffer, byteOffset, length);
            case ComponentDatatype.UNSIGNED_SHORT:
                return new Uint16Array(buffer, byteOffset, length);
            case ComponentDatatype.INT:
                return new Int32Array(buffer, byteOffset, length);
            case ComponentDatatype.UNSIGNED_INT:
                return new Uint32Array(buffer, byteOffset, length);
            case ComponentDatatype.FLOAT:
                return new Float32Array(buffer, byteOffset, length);
            case ComponentDatatype.DOUBLE:
                return new Float64Array(buffer, byteOffset, length);
            //>>includeStart('debug', pragmas.debug);
            default:
                throw new Error("componentDatatype is not a valid value.");
            //>>includeEnd('debug');
        }
    }

    public static fromName (name: string) {
        switch (name) {
            case "BYTE":
                return ComponentDatatype.BYTE;
            case "UNSIGNED_BYTE":
                return ComponentDatatype.UNSIGNED_BYTE;
            case "SHORT":
                return ComponentDatatype.SHORT;
            case "UNSIGNED_SHORT":
                return ComponentDatatype.UNSIGNED_SHORT;
            case "INT":
                return ComponentDatatype.INT;
            case "UNSIGNED_INT":
                return ComponentDatatype.UNSIGNED_INT;
            case "FLOAT":
                return ComponentDatatype.FLOAT;
            case "DOUBLE":
                return ComponentDatatype.DOUBLE;
            //>>includeStart('debug', pragmas.debug);
            default:
                throw new Error("name is not a valid value.");
            //>>includeEnd('debug');
        }
    }

}
