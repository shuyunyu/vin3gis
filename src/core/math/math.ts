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
    public static toRadians (degrees: number) {
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


}