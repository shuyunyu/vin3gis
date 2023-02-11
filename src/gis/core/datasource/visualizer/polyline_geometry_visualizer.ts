import { Object3D, Event, Vector2 } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Line2 } from "../../extend/line/line2";
import { LineGeometry } from "../../extend/line/line_geometry";
import { LineMaterial } from "../../extend/line/line_material";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PolylineGeometryVisualizer extends BaseGeometryVisualizer {

    private _mtl: LineMaterial;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.polyline;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const points = entity.polyline.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        const color = entity.polyline.color;
        const ps = [];
        const colors = [];
        points.forEach(p => {
            ps.push(p.x, p.y, p.z);
            colors.push(color.r, color.g, color.b);
        });
        const geometry = new LineGeometry();
        geometry.setPositions(ps);
        geometry.setColors(colors);
        const mtl = new LineMaterial({
            color: 0xffffff,
            linewidth: 5, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            //resolution:  // to be set by renderer, eventually
            resolution: new Vector2(renderer.size.width, renderer.size.height),
            dashed: false,
            alphaToCoverage: true
        });
        const line = new Line2(geometry, mtl);
        this._mtl = mtl;
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        this._disposableObjects.push(geometry, mtl);
        return line;
    }

    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        this._mtl.resolution = new Vector2(renderer.size.width, renderer.size.height);
    }

}