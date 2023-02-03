import { Entity } from "../entity";
import { BillboardSingleRenderData } from "../geometry/base_billboard_geometry";
import { BaseGeometry } from "../geometry/base_geometry";
import { PointGeometryVisualizer } from "./point_geometry_visualizer";

export class MultiPointGeometryVisualizer extends PointGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPoint;
    }

    protected getInstanceCount (entity: Entity): number {
        return entity.multiPoint.positions.length;
    }

    protected getRenderData (entity: Entity): BillboardSingleRenderData[] {
        return entity.multiPoint.getRenderData();
    }

}