export class math {

    private static RADIANS_PER_DEGREE = Math.PI / 180;

    private static DEGREE_PER_RADIANS = 180 / Math.PI;

    public static PI: number = Math.PI;

    public static TWO_PI: number = Math.PI * 2;

    public static PI_OVER_TWO: number = Math.PI / 2.0;

    public static EPSILON1: number = 0.1;

    public static EPSILON2: number = 0.01;

    public static EPSILON3: number = 0.001;

    public static EPSILON4: number = 0.0001;

    public static EPSILON5: number = 0.00001;

    public static EPSILON6: number = 0.000001;

    public static EPSILON7: number = 0.0000001;

    public static EPSILON8: number = 0.00000001;

    public static EPSILON9: number = 0.000000001;

    public static EPSILON10: number = 0.000000001;

    public static EPSILON11: number = 0.0000000001;

    public static EPSILON12: number = 0.00000000001;

    public static EPSILON13: number = 0.000000000001;

    public static EPSILON14: number = 0.0000000000001;

    public static EPSILON15: number = 0.00000000000001;

    public static EPSILON16: number = 0.000000000000001;

    public static EPSILON17: number = 0.0000000000000001;

    public static EPSILON18: number = 0.00000000000000001;

    public static EPSILON19: number = 0.000000000000000001;

    public static EPSILON20: number = 0.0000000000000000001;

    public static EPSILON21: number = 0.00000000000000000001;

    public static equalsEpsilon (left: number, right: number, relativeEpsilon?: number, absoluteEpsilon?: number) {
        relativeEpsilon = relativeEpsilon ?? 0.0;
        absoluteEpsilon = absoluteEpsilon ?? relativeEpsilon;
        var absDiff = Math.abs(left - right);
        return (
            absDiff <= absoluteEpsilon ||
            absDiff <= relativeEpsilon * Math.max(Math.abs(left), Math.abs(right))
        );
    }

    /**
     * 角度转弧度
     * @param degrees 
     * @returns 
     */
    public static toRadian (degrees: number) {
        return degrees * this.RADIANS_PER_DEGREE;
    }

    /**
     * 弧度转角度
     * @param radians 
     * @returns 
     */
    public static toDegree (radians: number) {
        return radians * this.DEGREE_PER_RADIANS;
    }

    /**
     * 返回最小浮点数和最大浮点数之间的一个数值。可以使用 clamp 函数将不断变化的数值限制在范围内。
     * @param val 
     * @param min 
     * @param max 
     * @returns 
     */
    public static clamp (val: number, min: number, max: number) {
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }

        return val < min ? min : val > max ? max : val;
    }

    public static negativePiToPi (angle: number) {
        if (angle >= -this.PI && angle <= this.PI) {
            // Early exit if the input is already inside the range. This avoids
            // unnecessary math which could introduce floating point error.
            return angle;
        }
        return this.zeroToTwoPi(angle + this.PI) - this.PI;
    }

    public static zeroToTwoPi (angle: number) {
        if (angle >= 0 && angle <= this.TWO_PI) {
            // Early exit if the input is already inside the range. This avoids
            // unnecessary math which could introduce floating point error.
            return angle;
        }
        var mod = this.mod(angle, this.TWO_PI);
        if (
            Math.abs(mod) < this.EPSILON14 &&
            Math.abs(angle) > this.EPSILON14
        ) {
            return this.TWO_PI;
        }
        return mod;
    }

    public static mod (m: number, n: number) {
        if (Math.sign(m) === Math.sign(n) && Math.abs(m) < Math.abs(n)) {
            // Early exit if the input does not need to be modded. This avoids
            // unnecessary math which could introduce floating point error.
            return m;
        }

        return ((m % n) + n) % n;
    }

}