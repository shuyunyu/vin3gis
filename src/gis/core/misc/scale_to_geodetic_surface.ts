import { math } from "../../../core/math/math";
import { Cartesian3 } from "../cartesian/cartesian3";

let scaleToGeodeticSurfaceIntersection = new Cartesian3();
let scaleToGeodeticSurfaceGradient = new Cartesian3();

export function scaleToGeodeticSurface (cartesian: Cartesian3, oneOverRadii: Cartesian3, oneOverRadiiSquared: Cartesian3, centerToleranceSquared: number, result?: Cartesian3) {
    let positionX = cartesian.x;
    let positionY = cartesian.y;
    let positionZ = cartesian.z;

    let oneOverRadiiX = oneOverRadii.x;
    let oneOverRadiiY = oneOverRadii.y;
    let oneOverRadiiZ = oneOverRadii.z;

    let x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
    let y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
    let z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;

    // Compute the squared ellipsoid norm.
    let squaredNorm = x2 + y2 + z2;
    let ratio = Math.sqrt(1.0 / squaredNorm);

    // As an initial approximation, assume that the radial intersection is the projection point.
    let intersection = Cartesian3.multiplyScalar(
        scaleToGeodeticSurfaceIntersection, cartesian, ratio
    );

    // If the position is near the center, the iteration will not converge.
    if (squaredNorm < centerToleranceSquared) {
        return !isFinite(ratio)
            ? undefined
            : intersection.clone(result);
    }

    let oneOverRadiiSquaredX = oneOverRadiiSquared.x;
    let oneOverRadiiSquaredY = oneOverRadiiSquared.y;
    let oneOverRadiiSquaredZ = oneOverRadiiSquared.z;

    // Use the gradient at the intersection point in place of the true unit normal.
    // The difference in magnitude will be absorbed in the multiplier.
    let gradient = scaleToGeodeticSurfaceGradient;
    gradient.x = intersection.x * oneOverRadiiSquaredX * 2.0;
    gradient.y = intersection.y * oneOverRadiiSquaredY * 2.0;
    gradient.z = intersection.z * oneOverRadiiSquaredZ * 2.0;

    // Compute the initial guess at the normal vector multiplier, lambda.
    let lambda =
        ((1.0 - ratio) * Cartesian3.len(cartesian)) /
        (0.5 * Cartesian3.len(gradient));
    let correction = 0.0;

    let func;
    let denominator;
    let xMultiplier;
    let yMultiplier;
    let zMultiplier;
    let xMultiplier2;
    let yMultiplier2;
    let zMultiplier2;
    let xMultiplier3;
    let yMultiplier3;
    let zMultiplier3;

    do {
        lambda -= correction;

        xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX);
        yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY);
        zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ);

        xMultiplier2 = xMultiplier * xMultiplier;
        yMultiplier2 = yMultiplier * yMultiplier;
        zMultiplier2 = zMultiplier * zMultiplier;

        xMultiplier3 = xMultiplier2 * xMultiplier;
        yMultiplier3 = yMultiplier2 * yMultiplier;
        zMultiplier3 = zMultiplier2 * zMultiplier;

        func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0;

        // "denominator" here refers to the use of this expression in the velocity and acceleration
        // computations in the sections to follow.
        denominator =
            x2 * xMultiplier3 * oneOverRadiiSquaredX +
            y2 * yMultiplier3 * oneOverRadiiSquaredY +
            z2 * zMultiplier3 * oneOverRadiiSquaredZ;

        let derivative = -2.0 * denominator;

        correction = func / derivative;
    } while (Math.abs(func) > math.EPSILON12);

    if (!result) {
        return new Cartesian3(
            positionX * xMultiplier,
            positionY * yMultiplier,
            positionZ * zMultiplier
        );
    }
    result!.x = positionX * xMultiplier;
    result!.y = positionY * yMultiplier;
    result!.z = positionZ * zMultiplier;
    return result;
}
