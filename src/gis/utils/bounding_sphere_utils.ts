import { Vector3 } from "three";
import { CoordinateOffsetType } from "../@types/core/gis";
import { Cartesian3 } from "../core/cartesian/cartesian3";
import { Cartographic } from "../core/cartographic";
import { BoundingSphereVolume } from "../core/scene/bounding_sphere_volume";
import { ITilingScheme } from "../core/tilingscheme/tiling_scheme";
import { Transform } from "../core/transform/transform";

const projectTo2DNormalScratch = new Cartesian3();
const projectTo2DEastScratch = new Cartesian3();
const projectTo2DNorthScratch = new Cartesian3();
const projectTo2DSouthScratch = new Cartesian3();
const projectTo2DWestScratch = new Cartesian3();
const projectTo2DPositionsScratch = new Array(8);
for (let n = 0; n < 8; ++n) {
    projectTo2DPositionsScratch[n] = new Cartesian3();
}
let projectTo2DCartographicScratch = new Cartographic();

let scratchCartographic = new Cartographic();

export class BoundingSphereUtils {

    public static project2D (tilingScheme: ITilingScheme, coordinateOffsetType: CoordinateOffsetType, boundingSphereRadius: number, boundingSphereCenter: Vector3) {
        let projection = tilingScheme.projection;
        let ellipsoid = projection.ellipsoid;
        let metersPerUnit = Transform.getMetersPerUnit();
        let centerCar = Transform.worldCar3ToCartographic(boundingSphereCenter, tilingScheme, scratchCartographic);
        let center = ellipsoid.cartographicToCartesian(centerCar);
        let radius = boundingSphereRadius * metersPerUnit;
        let normal;
        if (center.equals(Cartesian3.ZERO)) {
            normal = Cartesian3.UNIT_X.clone(projectTo2DNormalScratch);
        } else {
            normal = ellipsoid.geodeticSurfaceNormal(center, projectTo2DNormalScratch);
        }
        let east = Cartesian3.cross(projectTo2DEastScratch, Cartesian3.UNIT_Z, normal!);
        Cartesian3.normalize(east, east);
        let north = Cartesian3.cross(projectTo2DNorthScratch, normal!, east);
        Cartesian3.normalize(north, north);
        Cartesian3.multiplyScalar(normal!, normal!, radius);
        Cartesian3.multiplyScalar(north, north, radius);
        Cartesian3.multiplyScalar(east, east, radius);

        let south = Cartesian3.negate(projectTo2DSouthScratch, north);
        let west = Cartesian3.negate(projectTo2DWestScratch, east);

        let positions = projectTo2DPositionsScratch;

        // top NE corner
        let corner = positions[0];
        Cartesian3.add(corner, normal!, north);
        Cartesian3.add(corner, corner, east);

        // top NW corner
        corner = positions[1];
        Cartesian3.add(corner, normal!, north);
        Cartesian3.add(corner, corner, west);

        // top SW corner
        corner = positions[2];
        Cartesian3.add(corner, normal!, south);
        Cartesian3.add(corner, corner, west);

        // top SE corner
        corner = positions[3];
        Cartesian3.add(corner, normal!, south);
        Cartesian3.add(corner, corner, east);

        Cartesian3.negate(normal!, normal!);

        // bottom NE corner
        corner = positions[4];
        Cartesian3.add(corner, normal!, north);
        Cartesian3.add(corner, corner, east);

        // bottom NW corner
        corner = positions[5];
        Cartesian3.add(corner, normal!, north);
        Cartesian3.add(corner, corner, west);

        // bottom SW corner
        corner = positions[6];
        Cartesian3.add(corner, normal!, south);
        Cartesian3.add(corner, corner, west);

        // bottom SE corner
        corner = positions[7];
        Cartesian3.add(corner, normal!, south);
        Cartesian3.add(corner, corner, east);

        let length = positions.length;
        for (let i = 0; i < length; ++i) {
            let position = positions[i];
            Cartesian3.add(position, center, position);
            let cartographic = ellipsoid.cartesianToCartographic(position, projectTo2DCartographicScratch);
            projection.project(cartographic!, position);
        }

        let result = BoundingSphereVolume.fromPoints(positions, coordinateOffsetType);

        return result;

    }

}
