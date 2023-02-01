import { BufferGeometry, Event, Float32BufferAttribute, Object3D, Points, PointsMaterial, Texture } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BasePointGeometry } from "../geometry/base_point_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class MultiPointGeometryVisualizer extends BaseGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPoint;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer): Object3D<Event> {
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