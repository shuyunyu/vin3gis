import { math } from "../../../core/math/math";
import { ICartesian2Like, ICartesian3Like } from "../../@types/core/gis";
import { Cartesian3 } from "./cartesian3";

/**
 * 二维笛卡尔坐标
 * 二维向量
 */
export class Cartesian2 implements ICartesian2Like {

    public static ZERO = Object.freeze(new Cartesian2(0, 0));
    public static ONE = Object.freeze(new Cartesian2(1, 1));
    public static NEG_ONE = Object.freeze(new Cartesian2(-1, -1));
    public static UNIT_X = Object.freeze(new Cartesian2(1, 0));
    public static UNIT_Y = Object.freeze(new Cartesian2(0, 1));

    public x: number = 0;

    public y: number = 0;

    public constructor (x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
    * 克隆当前向量。
    */
    public clone (out?: Cartesian2) {
        if (out) {
            out.set(this.x, this.y);
            return out;
        }
        return new Cartesian2(this.x, this.y);
    }

    public set (x?: number | ICartesian2Like, y?: number) {
        if (x && typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        } else {
            //@ts-ignore
            this.x = x || 0;
            this.y = y || 0;
        }
        return this;
    }
    public copy (out: Cartesian2) {
        out.set(this.x, this.y);
        return out;
    }

    public equals (car2: Cartesian2) {
        return this.x === car2.x && this.y === car2.y;
    }

    /**
     * 返回当前向量的字符串表示。
     * @returns The string with vector information
     */
    public toString () {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /**
     * 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: ICartesian2Like, ratio: number) {
        const x = this.x;
        const y = this.y;
        this.x = x + ratio * (to.x - x);
        this.y = y + ratio * (to.y - y);
        return this;
    }

    /**
     * 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @return `this`
     */
    public clampf (minInclusive: ICartesian2Like, maxInclusive: ICartesian2Like) {
        this.x = math.clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = math.clamp(this.y, minInclusive.y, maxInclusive.y);
        return this;
    }

    /**
     * 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    public add (other: ICartesian2Like) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    public add2f (x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定向量
     * @param other specified vector
     */
    public subtract (other: ICartesian2Like) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    public subtract2f (x: number, y: number) {
        this.x -= x;
        this.y -= y;
        return this;
    }

    /**
     * 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    public multiplyScalar (scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * 向量乘法。将当前向量乘以与指定向量的结果赋值给当前向量。
     * @param other specified vector
     */
    public multiply (other: ICartesian2Like) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }

    /**
     * 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    public multiply2f (x: number, y: number) {
        this.x *= x;
        this.y *= y;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    public divide (other: ICartesian2Like) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }

    /**
     * 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    public divide2f (x: number, y: number) {
        this.x /= x;
        this.y /= y;
        return this;
    }

    /**
     * 将当前向量的各个分量取反
     */
    public negative () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * 向量点乘。
     * @param other specified vector
     * @return The result of calculates the dot product with another vector
     */
    public dot (other: ICartesian2Like) {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * 向量叉乘。
     * @param other specified vector
     * @return `out`
     */
    public cross (other: ICartesian2Like) {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * 计算向量的长度（模）。
     * @return Length of vector
     */
    public length () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 计算向量长度（模）的平方。
     * @return the squared length of this vector
     */
    public lengthSqr () {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 将当前向量归一化。
     */
    public normalize () {
        const x = this.x;
        const y = this.y;
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x *= len;
            this.y *= len;
        }
        return this;
    }

    /**
     * 获取当前向量和指定向量之间的角度。
     * @param other specified vector
     * @return The angle between the current vector and the specified vector (in radians); if there are zero vectors in the current vector and the specified vector, 0 is returned.
     */
    public angle (other: Cartesian2) {
        const magSqr1 = this.lengthSqr();
        const magSqr2 = other.lengthSqr();

        if (magSqr1 === 0 || magSqr2 === 0) {
            console.warn('Can\'t get angle between zero vector');
            return 0.0;
        }

        const dot = this.dot(other);
        let theta = dot / (Math.sqrt(magSqr1 * magSqr2));
        theta = math.clamp(theta, -1.0, 1.0);
        return Math.acos(theta);
    }

    /**
     * 获取当前向量和指定向量之间的有符号角度。<br/>
     * 有符号角度的取值范围为 (-180, 180]，当前向量可以通过逆时针旋转有符号角度与指定向量同向。<br/>
     * @param other specified vector
     * @return The signed angle between the current vector and the specified vector (in radians); if there is a zero vector in the current vector and the specified vector, 0 is returned.
     */
    public signAngle (other: Cartesian2) {
        const angle = this.angle(other);
        return this.cross(other) < 0 ? -angle : angle;
    }

    /**
     * 将当前向量的旋转
     * @param radians radius of rotation
     */
    public rotate (radians: number) {
        const x = this.x;
        const y = this.y;

        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        this.x = cos * x - sin * y;
        this.y = sin * x + cos * y;
        return this;
    }

    /**
     * 计算当前向量在指定向量上的投影向量。
     * @param other specified vector
     */
    public project (other: Cartesian2) {
        const scalar = this.dot(other) / other.dot(other);
        this.x = other.x * scalar;
        this.y = other.y * scalar;
        return this;
    }

    public distance (car2: Cartesian2) {
        return Math.sqrt(Math.pow(this.x - car2.x, 2) + Math.pow(this.y - car2.y, 2));
    }

    public static fromArray (arr: number[], out?: Cartesian2) {
        out = out || new Cartesian2();
        out.set(arr[0], arr[1]);
        return out;
    }

    public static fromCartesian2 (car2: ICartesian2Like, out?: Cartesian2) {
        out = out || new Cartesian2();
        out.set(car2.x, out.y);
        return out;
    }

    public static fromCartesian3 (car3: ICartesian3Like, out?: Cartesian2) {
        out = out || new Cartesian2();
        return this.set(out, car3.x, car3.y);
    }

    /**
     * 获得指定向量的拷贝
     */
    public static clone<Out extends ICartesian2Like> (a: Out) {
        return new Cartesian2(a.x, a.y);
    }

    /**
     * 复制目标向量
     */
    public static copy<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = a.x;
        out.y = a.y;
        return out;
    }

    /**
     * 设置向量值
     */
    public static set<Out extends ICartesian2Like> (out: Out, x: number, y: number) {
        out.x = x;
        out.y = y;
        return out;
    }

    /**
     * 逐元素向量加法
     */
    public static add<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        return out;
    }

    /**
     * 逐元素向量减法
     */
    public static subtract<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    }

    /**
     * 逐元素向量乘法
     */
    public static multiply<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        return out;
    }

    /**
     * 逐元素向量除法
     */
    public static divide<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        return out;
    }

    /**
     * 逐元素向量向上取整
     */
    public static ceil<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        return out;
    }

    /**
     * 逐元素向量向下取整
     */
    public static floor<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        return out;
    }

    /**
     * 逐元素向量最小值
     */
    public static min<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        return out;
    }

    /**
     * 逐元素向量最大值
     */
    public static max<Out extends ICartesian2Like> (out: Out, a: Out, b: Out) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        return out;
    }

    /**
     * 逐元素向量四舍五入取整
     */
    public static round<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        return out;
    }

    /**
     * 向量标量乘法
     */
    public static multiplyScalar<Out extends ICartesian2Like> (out: Out, a: Out, b: number) {
        out.x = a.x * b;
        out.y = a.y * b;
        return out;
    }

    /**
     * 逐元素向量乘加: A + B * scale
     */
    public static scaleAndAdd<Out extends ICartesian2Like> (out: Out, a: Out, b: Out, scale: number) {
        out.x = a.x + (b.x * scale);
        out.y = a.y + (b.y * scale);
        return out;
    }

    /**
     * 求两向量的欧氏距离
     */
    public static distance<Out extends ICartesian2Like> (a: Out, b: Out) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * 求两向量的欧氏距离平方
     */
    public static squaredDistance<Out extends ICartesian2Like> (a: Out, b: Out) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        return x * x + y * y;
    }

    /**
     * 求向量长度
     */
    public static len<Out extends ICartesian2Like> (a: Out) {
        const x = a.x;
        const y = a.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * 求向量长度平方
     */
    public static lengthSqr<Out extends ICartesian2Like> (a: Out) {
        const x = a.x;
        const y = a.y;
        return x * x + y * y;
    }

    /**
     * 逐元素向量取负
     */
    public static negate<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = -a.x;
        out.y = -a.y;
        return out;
    }

    /**
     * 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    public static inverse<Out extends ICartesian2Like> (out: Out, a: Out) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        return out;
    }

    /**
     * 逐元素向量取倒数，接近 0 时返回 0
     */
    public static inverseSafe<Out extends ICartesian2Like> (out: Out, a: Out) {
        const x = a.x;
        const y = a.y;

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

        return out;
    }

    /**
     * 归一化向量
     */
    public static normalize<Out extends ICartesian2Like, Vec2Like extends ICartesian2Like> (out: Out, a: Vec2Like) {
        const x = a.x;
        const y = a.y;
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
        return out;
    }

    /**
     * 向量点积（数量积）
     */
    public static dot<Out extends ICartesian2Like> (a: Out, b: Out) {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * 向量叉积（向量积），注意二维向量的叉积为与 Z 轴平行的三维向量
     */
    public static cross (out: ICartesian2Like | Cartesian3, a: ICartesian2Like, b?: ICartesian2Like): number | Cartesian3 {
        if (out instanceof Cartesian3) {
            out.x = out.y = 0;
            out.z = a.x * b!.y - a.y * b!.x;
            return out;
        } else {
            return out.x * a.y - out.y * a.x;
        }
    }

    /**
     * @en Calculates the linear interpolation between two vectors with a given ratio
     * @zh 逐元素向量线性插值： A + t * (B - A)
     */
    public static lerp<Out extends ICartesian2Like> (out: Out, a: Out, b: Out, t: number) {
        const x = a.x;
        const y = a.y;
        out.x = x + t * (b.x - x);
        out.y = y + t * (b.y - y);
        return out;
    }

    /**
     * @en Generates a uniformly distributed random vector points from center to the surface of the unit sphere
     * @zh 生成一个在单位圆上均匀分布的随机向量
     * @param scale vector length
     */
    public static random<Out extends ICartesian2Like> (out: Out, scale?: number) {
        scale = scale || 1.0;
        const r = Math.random() * 2.0 * Math.PI;
        out.x = Math.cos(r) * scale;
        out.y = Math.sin(r) * scale;
        return out;
    }

    /**
     * 求两向量夹角弧度
     */
    public static angle<Out extends ICartesian2Like> (a: Out, b: Out) {
        Cartesian2.normalize(v2_1, a);
        Cartesian2.normalize(v2_2, b);
        const cosine = Cartesian2.dot(v2_1, v2_2);
        if (cosine > 1.0) {
            return 0;
        }
        if (cosine < -1.0) {
            return Math.PI;
        }
        return Math.acos(cosine);
    }


}

const v2_1 = new Cartesian2(0.0, 0.0);
const v2_2 = new Cartesian2(0.0, 0.0);