import { Object3D, Event, Texture, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from "three";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BasePointGeometry } from "../geometry/base_point_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PointGeometryVisualizer extends BaseGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.point;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D<Event> {
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
        const texture = new Texture(canvas);
        texture.needsUpdate = true;
        const geometry = this.createGeometry(entity, tilingScheme);
        const mtl = new PointsMaterial({
            size: fullSize,
            sizeAttenuation: false,
            map: texture,
            transparent: true,
            depthTest: false
        });
        const pts = new Points(geometry, mtl);

        this._disposableObjects.push(geometry, mtl, texture);

        return pts;
    }

    protected createGeometry (entity: Entity, tilingScheme: ITilingScheme) {
        const coord = Transform.cartographicToWorldVec3(entity.point.position, tilingScheme);
        const vertices = new Float32Array([coord.x, coord.y, coord.z]);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        return geometry;
    }

}