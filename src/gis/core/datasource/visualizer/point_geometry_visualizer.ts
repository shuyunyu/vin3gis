import { Object3D, Event, Texture, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from "three";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { GEOMETRY_RENDER_ORDER } from "../../misc/render_order";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PointGeometryVisualizer extends BaseGeometryVisualizer {

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D<Event> {
        const point = entity.point;
        const fullSize = point.outline ? point.size + point.outlineSize : point.size;
        const canvas = pointGeometryCanvasProvider.createCanvas({
            canvasSize: fullSize,
            size: point.size,
            color: point.color,
            outline: point.outline,
            outlineSize: point.outlineSize,
            outlineColor: point.outlineColor
        });
        const texture = new Texture(canvas);
        texture.needsUpdate = true;
        const coord = Transform.cartographicToWorldVec3(point.position, tilingScheme);
        const vertices = new Float32Array([coord.x, coord.y, coord.z]);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        const mtl = new PointsMaterial({
            size: fullSize,
            sizeAttenuation: point.sizeAttenuation,
            map: texture,
            transparent: true,
            depthTest: false
        });
        const pts = new Points(geometry, mtl);
        pts.renderOrder = GEOMETRY_RENDER_ORDER;
        return pts;
    }

}