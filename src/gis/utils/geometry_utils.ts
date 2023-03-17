import { Box3, Vector3 } from "three";
import { ICartesian3Like } from "../@types/core/gis";

export class GeometryUtils {

    public static createBox3 (center: ICartesian3Like, halfWidth: number, halfHeight: number, halfLength: number) {
        const xmin = center.x - halfWidth;
        const xmax = center.x + halfWidth;
        const ymin = center.y - halfHeight;
        const ymax = center.y + halfHeight;
        const zmin = center.z - halfLength;
        const zmax = center.z + halfLength;
        return new Box3(new Vector3(xmin, ymin, zmin), new Vector3(xmax, ymax, zmax));
    }

}