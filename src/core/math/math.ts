export class math {

    public static equalsEpsilon (left: number, right: number, relativeEpsilon?: number, absoluteEpsilon?: number) {
        relativeEpsilon = relativeEpsilon ?? 0.0;
        absoluteEpsilon = absoluteEpsilon ?? relativeEpsilon;
        var absDiff = Math.abs(left - right);
        return (
            absDiff <= absoluteEpsilon ||
            absDiff <= relativeEpsilon * Math.max(Math.abs(left), Math.abs(right))
        );
    }

}