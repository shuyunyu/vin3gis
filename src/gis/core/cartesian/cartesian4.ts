import { math } from "../../../core/math/math";
import { ICartesian2Like, ICartesian3Like, ICartesian4Like, IQuatLike } from "../../@types/core/gis";

/**
 * 四维笛卡尔坐标
 * 四维向量
 */
export class Cartesian4 implements ICartesian2Like, ICartesian3Like, ICartesian4Like {

    public static ZERO = Object.freeze(new Cartesian4(0, 0, 0, 0));
    public static ONE = Object.freeze(new Cartesian4(1, 1, 1, 1));
    public static NEG_ONE = Object.freeze(new Cartesian4(-1, -1, -1, -1));
    public static UNIT_W = Object.freeze(new Cartesian4(0, 0, 0, 1));

    public x: number = 0;

    public y: number = 0;

    public z: number = 0;

    public w: number = 0;

    public constructor (x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * 克隆当前向量。
     */
    public clone (out?: Cartesian4) {
        if (out) {
            out.set(this.x, this.y, this.z, this.w);
            return out;
        }
        return new Cartesian4(this.x, this.y, this.z, this.w);
    }


    /**
     * 设置当前向量使其与指定向量相等。
     * @param other Specified vector
     * @returns `this`
     */
    public set (x?: number | ICartesian4Like, y?: number, z?: number, w?: number) {
        if (x && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        } else {
            //@ts-ignore
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w || 0;
        }
        return this;
    }

    /**
     * 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: ICartesian4Like, ratio: number) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        this.x = x + ratio * (to.x - x);
        this.y = y + ratio * (to.y - y);
        this.z = z + ratio * (to.z - z);
        this.w = w + ratio * (to.w - w);
        return this;
    }

    /**
     * 返回当前向量的字符串表示。
     * @returns The string with vector information
     */
    public toString () {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, ${this.w.toFixed(2)})`;
    }

    /**
     * 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @returns `this`
     */
    public clampf (minInclusive: ICartesian4Like, maxInclusive: ICartesian4Like) {
        this.x = math.clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = math.clamp(this.y, minInclusive.y, maxInclusive.y);
        this.z = math.clamp(this.z, minInclusive.z, maxInclusive.z);
        this.w = math.clamp(this.w, minInclusive.w, maxInclusive.w);
        return this;
    }

    /**
     * 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    public add (other: ICartesian4Like) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        this.w += other.w;
        return this;
    }

    /**
     * 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    public add4f (x: number, y: number, z: number, w: number) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.w += w;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定向量
     * @param other specified vector
     */
    public subtract (other: ICartesian4Like) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        this.w -= other.w;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    public subtract4f (x: number, y: number, z: number, w: number) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        this.w -= w;
        return this;
    }

    /**
     * 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    public multiplyScalar (scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    }

    /**
     * 向量乘法。将当前向量乘以指定向量
     * @param other specified vector
     */
    public multiply (other: ICartesian4Like) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        this.w *= other.w;
        return this;
    }

    /**
     * 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    public multiply4f (x: number, y: number, z: number, w: number) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        this.w *= w;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    public divide (other: ICartesian4Like) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        this.w /= other.w;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    public divide4f (x: number, y: number, z: number, w: number) {
        this.x /= x;
        this.y /= y;
        this.z /= z;
        this.w /= w;
        return this;
    }

    /**
     * 将当前向量的各个分量取反
     */
    public negative () {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }

    /**
     * 向量点乘。
     * @param other specified vector
     * @returns 当前向量与指定向量点乘的结果。
     */
    public dot (vector: ICartesian4Like) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w;
    }

    /**
     * 向量叉乘。视当前向量和指定向量为三维向量（舍弃 w 分量），将当前向量左叉乘指定向量
     * @param other specified vector
     */
    public cross (vector: ICartesian4Like) {
        const { x: ax, y: ay, z: az } = this;
        const { x: bx, y: by, z: bz } = vector;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }

    /**
     * @en Returns the length of this vector.
     * @zh 计算向量的长度（模）。
     * @returns Length of vector
     */
    public length () {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    /**
     * @en Returns the squared length of this vector.
     * @zh 计算向量长度（模）的平方。
     * @returns the squared length of this vector
     */
    public lengthSqr () {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }

    /**
     * @en Normalize the current vector.
     * @zh 将当前向量归一化
     */
    public normalize () {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
            this.w = w * len;
        }
        return this;
    }

    public equals (car4: Cartesian4) {
        return this.x === car4.x && this.y === car4.y && this.z === car4.z && this.w === car4.w;
    }

    /**
     * 获得指定向量的拷贝
     */
    public static clone<Out extends ICartesian4Like> (a: Out) {
        return new Cartesian4(a.x, a.y, a.z, a.w);
    }

    /**
     * 复制目标向量
     */
    public static copy<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        out.w = a.w;
        return out;
    }

    /**
     * 设置向量值
     */
    public static set<Out extends ICartesian4Like> (out: Out, x: number, y: number, z: number, w: number) {
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
        return out;
    }

    /**
     * 逐元素向量加法
     */
    public static add<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
        return out;
    }

    /**
     * 逐元素向量减法
     */
    public static subtract<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
        return out;
    }

    /**
     * 逐元素向量乘法
     */
    public static multiply<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        out.w = a.w * b.w;
        return out;
    }

    /**
     * 逐元素向量除法
     */
    public static divide<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
        out.w = a.w / b.w;
        return out;
    }

    /**
     * 逐元素向量向上取整
     */
    public static ceil<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        out.z = Math.ceil(a.z);
        out.w = Math.ceil(a.w);
        return out;
    }

    /**
     * 逐元素向量向下取整
     */
    public static floor<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        out.z = Math.floor(a.z);
        out.w = Math.floor(a.w);
        return out;
    }

    /**
     * 逐元素向量最小值
     */
    public static min<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
        return out;
    }

    /**
     * 逐元素向量最大值
     */
    public static max<Out extends ICartesian4Like> (out: Out, a: Out, b: Out) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
        return out;
    }

    /**
     * 逐元素向量四舍五入取整
     */
    public static round<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        out.z = Math.round(a.z);
        out.w = Math.round(a.w);
        return out;
    }

    /**
     * 向量标量乘法
     */
    public static multiplyScalar<Out extends ICartesian4Like> (out: Out, a: Out, b: number) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
        return out;
    }

    /**
     * 逐元素向量乘加: A + B * scale
     */
    public static scaleAndAdd<Out extends ICartesian4Like> (out: Out, a: Out, b: Out, scale: number) {
        out.x = a.x + (b.x * scale);
        out.y = a.y + (b.y * scale);
        out.z = a.z + (b.z * scale);
        out.w = a.w + (b.w * scale);
        return out;
    }

    /**
     * 求两向量的欧氏距离
     */
    public static distance<Out extends ICartesian4Like> (a: Out, b: Out) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        const w = b.w - a.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    /**
     * 求两向量的欧氏距离平方
     */
    public static squaredDistance<Out extends ICartesian4Like> (a: Out, b: Out) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        const w = b.w - a.w;
        return x * x + y * y + z * z + w * w;
    }

    /**
     * 求向量长度
     */
    public static len<Out extends ICartesian4Like> (a: Out) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    /**
     * 求向量长度平方
     */
    public static lengthSqr<Out extends ICartesian4Like> (a: Out) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        return x * x + y * y + z * z + w * w;
    }

    /**
     * 逐元素向量取负
     */
    public static negate<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        out.w = -a.w;
        return out;
    }

    /**
     * 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    public static inverse<Out extends ICartesian4Like> (out: Out, a: Out) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        out.z = 1.0 / a.z;
        out.w = 1.0 / a.w;
        return out;
    }

    /**
     * 逐元素向量取倒数，接近 0 时返回 0
     */
    public static inverseSafe<Out extends ICartesian4Like> (out: Out, a: Out) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;

        if (Math.abs(x) < math.EPSILON6) {
            out.x = 0;
        } else {
            out.x = 1.0 / x;
        }

        if (Math.abs(y) < math.EPSILON6) {
            out.y = 0;
        } else {
            out.y = 1.0 / y;
        }

        if (Math.abs(z) < math.EPSILON6) {
            out.z = 0;
        } else {
            out.z = 1.0 / z;
        }

        if (Math.abs(w) < math.EPSILON6) {
            out.w = 0;
        } else {
            out.w = 1.0 / w;
        }

        return out;
    }

    /**
     * 归一化向量
     */
    public static normalize<Out extends ICartesian4Like> (out: Out, a: Out) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
            out.w = w * len;
        }
        return out;
    }

    /**
     * 向量点积（数量积）
     */
    public static dot<Out extends ICartesian4Like> (a: Out, b: Out) {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    }

    /**
     * 逐元素向量线性插值： A + t * (B - A)
     */
    public static lerp<Out extends ICartesian4Like> (out: Out, a: Out, b: Out, t: number) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        out.w = a.w + t * (b.w - a.w);
        return out;
    }

    /**
     * 生成一个在单位球体上均匀分布的随机向量
     * @param scale vector length
     */
    public static random<Out extends ICartesian4Like> (out: Out, scale?: number) {
        scale = scale || 1.0;

        const phi = Math.random() * 2.0 * Math.PI;
        const cosTheta = Math.random() * 2 - 1;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

        out.x = sinTheta * Math.cos(phi) * scale;
        out.y = sinTheta * Math.sin(phi) * scale;
        out.z = cosTheta * scale;
        out.w = 0;
        return out;
    }

    /**
     * 向量四元数乘法
     */
    public static transformQuat<Out extends ICartesian4Like, QuatLike extends IQuatLike> (out: Out, a: Out, q: QuatLike) {
        const { x, y, z } = a;

        const _x = q.x;
        const _y = q.y;
        const _z = q.z;
        const _w = q.w;

        // calculate quat * vec
        const ix = _w * x + _y * z - _z * y;
        const iy = _w * y + _z * x - _x * z;
        const iz = _w * z + _x * y - _y * x;
        const iw = -_x * x - _y * y - _z * z;

        // calculate result * inverse quat
        out.x = ix * _w + iw * -_x + iy * -_z - iz * -_y;
        out.y = iy * _w + iw * -_y + iz * -_x - ix * -_z;
        out.z = iz * _w + iw * -_z + ix * -_y - iy * -_x;
        out.w = a.w;
        return out;
    }

    /**
     * 向量转数组
     * @param ofs Array Start Offset
     */
    public static toArray (out: number[], v: ICartesian4Like, ofs = 0) {
        out[ofs + 0] = v.x;
        out[ofs + 1] = v.y;
        out[ofs + 2] = v.z;
        out[ofs + 3] = v.w;
        return out;
    }

    /**
     * 数组转向量
     * @param ofs Array Start Offset
     */
    public static fromArray<Out extends ICartesian4Like> (out: Out, arr: number[], ofs = 0) {
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        out.z = arr[ofs + 2];
        out.w = arr[ofs + 3];
        return out;
    }

    public static equals (left: Cartesian4, right: Cartesian4) {
        return left.equals(right);
    }

    public static unpack (arr: number[], startIndex: number = 0, out?: Cartesian4) {
        out = out || new Cartesian4();
        out.set(arr[startIndex++], arr[startIndex++], arr[startIndex++], arr[startIndex]);
        return out;
    }

}
