import { BufferGeometry, Float32BufferAttribute } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { PointGeometryVisualizer } from "./point_geometry_visualizer";

export class MultiPointGeometryVisualizer extends PointGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPoint;
    }

    protected createGeometry (entity: Entity, tilingScheme: ITilingScheme): BufferGeometry {
        const coordArray = entity.multiPoint.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        const coords: number[] = [];
        coordArray.forEach(coord => {
            coords.push(coord.x, coord.y, coord.z);
        })
        const vertices = new Float32Array(coords);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        return geometry;
    }

}