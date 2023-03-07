import { Vector3 } from "three";
import { math } from "../../../core/math/math";
import { ICartesian2Like, ICartesian3Like, ICartesian4Like, IQuatLike } from "../../@types/core/gis";

/**
 * 三维笛卡尔坐标
 * 三维向量
 */
export class Cartesian3 implements ICartesian2Like, ICartesian3Like {

    public static UNIT_X = Object.freeze(new Cartesian3(1, 0, 0));
    public static UNIT_Y = Object.freeze(new Cartesian3(0, 1, 0));
    public static UNIT_Z = Object.freeze(new Cartesian3(0, 0, 1));
    public static RIGHT = Object.freeze(new Cartesian3(1, 0, 0));
    public static UP = Object.freeze(new Cartesian3(0, 1, 0));
    public static FORWARD = Object.freeze(new Cartesian3(0, 0, -1)); // we use -z for view-dir
    public static ZERO = Object.freeze(new Cartesian3(0, 0, 0));
    public static ONE = Object.freeze(new Cartesian3(1, 1, 1));
    public static NEG_ONE = Object.freeze(new Cartesian3(-1, -1, -1));

    public x: number = 0;

    public y: number = 0;

    public z: number = 0;

    public constructor (x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 克隆当前向量。
     */
    public clone (out?: Cartesian3) {
        if (out) {
            out.set(this.x, this.y, this.z);
            return out;
        }
        return new Cartesian3(this.x, this.y, this.z);
    }

    public set (x?: number | ICartesian3Like, y?: number, z?: number) {
        if (x && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            //@ts-ignore
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        return this;
    }

    /**
     * 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: ICartesian3Like, ratio: number) {
        this.x += ratio * (to.x - this.x);
        this.y += ratio * (to.y - this.y);
        this.z += ratio * (to.z - this.z);
        return this;
    }

    /**
     * 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    public add (other: ICartesian3Like) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }

    /**
     * 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    public add3f (x: number, y: number, z: number) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定向量的结果。
     * @param other specified vector
     */
    public subtract (other: ICartesian3Like) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    public subtract3f (x: number, y: number, z: number) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
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
        return this;
    }

    /**
     * 向量乘法。将当前向量乘以与指定向量的结果赋值给当前向量。
     * @param other specified vector
     */
    public multiply (other: ICartesian3Like) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        return this;
    }

    /**
     * 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    public multiply3f (x: number, y: number, z: number) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    public divide (other: ICartesian3Like) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    public divide3f (x: number, y: number, z: number) {
        this.x /= x;
        this.y /= y;
        this.z /= z;
        return this;
    }

    /**
     * 将当前向量的各个分量取反
     */
    public negative () {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    /**
     * 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @returns `this`
     */
    public clampf (minInclusive: ICartesian3Like, maxInclusive: ICartesian3Like) {
        this.x = math.clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = math.clamp(this.y, minInclusive.y, maxInclusive.y);
        this.z = math.clamp(this.z, minInclusive.z, maxInclusive.z);
        return this;
    }

    /**
     * 向量点乘。
     * @param other specified vector
     * @returns The result of calculates the dot product with another vector
     */
    public dot (other: ICartesian3Like) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    /**
     * 向量叉乘。将当前向量左叉乘指定向量
     * @param other specified vector
     */
    public cross (other: ICartesian3Like) {
        const { x: ax, y: ay, z: az } = this;
        const { x: bx, y: by, z: bz } = other;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }

    /**
     * 计算向量的长度（模）。
     * @returns Length of vector
     */
    public length () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * 计算向量长度（模）的平方。
     * @returns the squared length of this vector
     */
    public lengthSqr () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * 将当前向量归一化
     */
    public normalize () {
        const x = this.x;
        const y = this.y;
        const z = this.z;

        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
        }
        return this;
    }

    public equals (car3: Cartesian3) {
        return this.x === car3.x && this.y === car3.y && this.z === car3.z;
    }

    public equalsEpsilon (car3: Cartesian3, relativeEpsilon?: number, absoluteEpsilon?: number) {
        return this === car3 || (
            math.equalsEpsilon(this.x, car3.x, relativeEpsilon, absoluteEpsilon)
            && math.equalsEpsilon(this.y, car3.y, relativeEpsilon, absoluteEpsilon)
            && math.equalsEpsilon(this.z, car3.z, relativeEpsilon, absoluteEpsilon)
        )
    }

    public distance (car3: Cartesian3) {
        const x = this.x - car3.x;
        const y = this.y - car3.y;
        const z = this.z - car3.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    public midpoint (car: Cartesian3, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.x = (this.x + car.x) * 0.5;
        out.y = (this.y + car.y) * 0.5;
        out.z = (this.z + car.z) * 0.5;
        return out;
    }

    public max () {
        return Math.max(this.x, this.y, this.z);
    }

    public min () {
        return Math.min(this.x, this.y, this.z);
    }

    public toArray (out?: number[]) {
        if (out) {
            out[0] = this.x;
            out[1] = this.y;
            out[2] = this.z;
            return out;
        } else {
            return [this.x, this.y, this.z];
        }
    }

    public toVec3 (out?: Vector3) {
        out = out || new Vector3();
        out.set(this.x, this.y, this.z);
        return out;
    }

    public toString () {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }

    /**
     * 将目标赋值为零向量
     */
    public static zero<Out extends ICartesian3Like> (out: Out) {
        out.x = 0;
        out.y = 0;
        out.z = 0;
        return out;
    }

    /**
     * 获得指定向量的拷贝
     */
    public static clone<Out extends ICartesian3Like> (a: Out) {
        return new Cartesian3(a.x, a.y, a.z);
    }

    /**
     * =复制目标向量
     */
    public static copy<Out extends ICartesian3Like, Vec3Like extends ICartesian3Like> (out: Out, a: Vec3Like) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        return out;
    }

    /**
    * 设置向量值
    */
    public static set<Out extends ICartesian3Like> (out: Out, x: number, y: number, z: number) {
        out.x = x;
        out.y = y;
        out.z = z;
        return out;
    }

    /**
     * 逐元素向量加法
     */
    public static add<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        return out;
    }

    /**
     * 逐元素向量减法
     */
    public static subtract<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        return out;
    }

    /**
     * 逐元素向量乘法 (分量积)
     */
    public static multiply<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        return out;
    }

    /**
     * 逐元素向量除法
     */
    public static divide<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
        return out;
    }

    /**
     * 逐元素向量向上取整
     */
    public static ceil<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        out.z = Math.ceil(a.z);
        return out;
    }

    /**
     * 逐元素向量向下取整
     */
    public static floor<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        out.z = Math.floor(a.z);
        return out;
    }

    /**
     * 逐元素向量最小值
     */
    public static min<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        return out;
    }

    /**
     * 逐元素向量最大值
     */
    public static max<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        return out;
    }

    /**
     *  逐元素向量四舍五入取整
     */
    public static round<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        out.z = Math.round(a.z);
        return out;
    }

    /**
     * 向量标量乘法
     */
    public static multiplyScalar<Out extends ICartesian3Like, Vec3Like extends ICartesian3Like> (out: Out, a: Vec3Like, b: number) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        return out;
    }

    /**
    * 逐元素向量乘加: A + B * scale
    */
    public static scaleAndAdd<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like, scale: number) {
        out.x = a.x + b.x * scale;
        out.y = a.y + b.y * scale;
        out.z = a.z + b.z * scale;
        return out;
    }

    /**
     *  求两向量的欧氏距离
     */
    public static distance (a: ICartesian3Like, b: ICartesian3Like) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * 求两向量的欧氏距离平方
     */
    public static squaredDistance (a: ICartesian3Like, b: ICartesian3Like) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        return x * x + y * y + z * z;
    }

    /**
     * @en Calculates the length of the vector
     * @zh 求向量长度
     */
    public static len (a: ICartesian3Like) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * @en Calculates the squared length of the vector
     * @zh 求向量长度平方
     */
    public static lengthSqr (a: ICartesian3Like) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        return x * x + y * y + z * z;
    }

    /**
     * 逐元素向量取负
     */
    public static negate<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        return out;
    }

    /**
     * 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    public static invert<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        out.z = 1.0 / a.z;
        return out;
    }

    /**
    * 逐元素向量取倒数，接近 0 时返回 0
    */
    public static invertSafe<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        const x = a.x;
        const y = a.y;
        const z = a.z;

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

        return out;
    }

    /**
     * 归一化向量
     */
    public static normalize<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like) {
        const x = a.x;
        const y = a.y;
        const z = a.z;

        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
        }
        return out;
    }

    /**
     * 向量点积（数量积）
     */
    public static dot<Out extends ICartesian3Like> (a: Out, b: ICartesian3Like) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    /**
     * 向量叉积（向量积）
     */
    public static cross<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        const { x: ax, y: ay, z: az } = a;
        const { x: bx, y: by, z: bz } = b;
        out.x = ay * bz - az * by;
        out.y = az * bx - ax * bz;
        out.z = ax * by - ay * bx;
        return out;
    }

    /**
     * 逐元素向量线性插值： A + t * (B - A)
     */
    public static lerp<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like, t: number) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        return out;
    }

    /**
     * 生成一个在单位球体上均匀分布的随机向量
     * @param scale vector length
     */
    public static random<Out extends ICartesian3Like> (out: Out, scale?: number) {
        scale = scale || 1.0;

        const phi = Math.random() * 2.0 * Math.PI;
        const cosTheta = Math.random() * 2 - 1;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

        out.x = sinTheta * Math.cos(phi) * scale;
        out.y = sinTheta * Math.sin(phi) * scale;
        out.z = cosTheta * scale;
        return out;
    }

    /**
     * @en Vector quaternion multiplication
     * @zh 向量四元数乘法
     */
    public static transformQuat<Out extends ICartesian4Like> (out: Out, a: ICartesian4Like, q: IQuatLike) {
        // benchmarks: http://jsperf.com/quaternion-transform-Vec3-implementations

        // calculate quat * vec
        const ix = q.w * a.x + q.y * a.z - q.z * a.y;
        const iy = q.w * a.y + q.z * a.x - q.x * a.z;
        const iz = q.w * a.z + q.x * a.y - q.y * a.x;
        const iw = -q.x * a.x - q.y * a.y - q.z * a.z;

        // calculate result * inverse quat
        out.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
        out.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
        out.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        return out;
    }

    /**
     * 绕 X 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radius of rotation
     */
    public static rotateX<Out extends ICartesian3Like> (out: Out, v: ICartesian3Like, o: ICartesian3Like, a: number) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;

        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = x;
        const ry = y * cos - z * sin;
        const rz = y * sin + z * cos;

        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;

        return out;
    }

    /**
     * 绕 Y 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radius of rotation
     */
    public static rotateY<Out extends ICartesian3Like> (out: Out, v: ICartesian3Like, o: ICartesian3Like, a: number) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;

        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = z * sin + x * cos;
        const ry = y;
        const rz = z * cos - x * sin;

        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;

        return out;
    }

    /**
     * 绕 Z 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radius of rotation
     */
    public static rotateZ<Out extends ICartesian3Like> (out: Out, v: ICartesian3Like, o: ICartesian3Like, a: number) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;

        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        const rz = z;

        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;

        return out;
    }

    /**
    * 求两向量夹角弧度
    */
    public static angle (a: ICartesian3Like, b: ICartesian3Like) {
        Cartesian3.normalize(v3_1, a);
        Cartesian3.normalize(v3_2, b);
        const cosine = Cartesian3.dot(v3_1, v3_2);
        if (cosine > 1.0) {
            return 0;
        }
        if (cosine < -1.0) {
            return Math.PI;
        }
        return Math.acos(cosine);
    }

    /**
     * @en Calculates the projection vector on the specified plane
     * @zh 计算向量在指定平面上的投影
     * @param a projection vector
     * @param n the normal line of specified plane
     */
    public static projectOnPlane<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, n: ICartesian3Like) {
        return Cartesian3.subtract(out, a, Cartesian3.project(out, a, n));
    }

    /**
     * @en Calculates the projection on the specified vector
     * @zh 计算向量在指定向量上的投影
     * @param a projection vector
     * @param n target vector
     */
    public static project<Out extends ICartesian3Like> (out: Out, a: ICartesian3Like, b: ICartesian3Like) {
        const sqrLen = Cartesian3.lengthSqr(b);
        if (sqrLen < 0.000001) {
            return Cartesian3.set(out, 0, 0, 0);
        } else {
            return Cartesian3.multiplyScalar(out, b, Cartesian3.dot(a, b) / sqrLen);
        }
    }

    public static fromArray (arr: number[], out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(arr[0], arr[1], arr[2]);
        return out;
    }

    public static fromCartesian2 (car2: ICartesian2Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(car2.x, car2.y, 0);
        return out;
    }

    public static fromCartesian3 (car3: ICartesian3Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(car3.x, car3.y, car3.z);
        return out;
    }


    public static equals (left: Cartesian3, right: Cartesian3) {
        return left.equals(right);
    }

    public static equalsEpsilon (left: Cartesian3, right: Cartesian3, relativeEpsilon?: number, absoluteEpsilon?: number) {
        return left.equalsEpsilon(right, relativeEpsilon, absoluteEpsilon);
    }

    public static midpoint (left: Cartesian3, right: Cartesian3, out?: Cartesian3) {
        return left.midpoint(right, out);
    }

    public static unpack (arr: number[], startIndex: number = 0, out?: Cartesian3) {
        out = out || new Cartesian3();
        out.set(arr[startIndex++], arr[startIndex++], arr[startIndex]);
        return out;
    }

    public static toVec3 (car3: Cartesian3, out?: Vector3) {
        return car3.toVec3(out);
    }

    public static divideComponents (left: Cartesian3, right: Cartesian3, result: Cartesian3) {
        result.x = left.x / right.x;
        result.y = left.y / right.y;
        result.z = left.z / right.z;
        return result;
    }

}

const v3_1 = new Cartesian3();
const v3_2 = new Cartesian3();

