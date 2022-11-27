export class math {

    private static RADIANS_PER_DEGREE = Math.PI / 180;

    private static DEGREE_PER_RADIANS = 180 / Math.PI;

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