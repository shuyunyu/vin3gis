import { ICartesian2Like } from "../../../@types/core/gis";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { Entity } from "../entity";
import { BillboardSingleRenderData } from "../geometry/base_billboard_geometry";
import { BaseGeometry } from "../geometry/base_geometry";
import { BasePointGeometry } from "../geometry/base_point_geometry";
import { BillboardGeometryVisualizer } from "./billboard_geometry_visualizer";

export class PointGeometryVisualizer extends BillboardGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.point;
    }

    protected getImageAnchor (entity: Entity): ICartesian2Like {
        return { x: 0.5, y: 0.5 };
    }

    protected checkReady (entity: Entity): boolean {
        return true;
    }

    protected getInstanceCount (entity: Entity): number {
        return 1;
    }

    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        const basePointGeometry = this.getEntityGeometry(entity) as BasePointGeometry;
        const fullSize = basePointGeometry.outline ? basePointGeometry.size + basePointGeometry.outlineSize : basePointGeometry.size;
        const canvas = pointGeometryCanvasProvider.createCanvas({
            canvasSize: fullSize,
            size: basePointGeometry.size,
            color: basePointGeometry.color,
            outline: basePointGeometry.outline,
            outlineSize: basePointGeometry.outlineSize,
            outlineColor: basePointGeometry.outlineColor
        });
        return canvas;
    }

    protected getRenderData (entity: Entity): BillboardSingleRenderData[] {
        return entity.point.getRenderData();
    }

}