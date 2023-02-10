import { Object3D, Event, Color } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Line2 } from "../../extend/line/line2";
import { LineGeometry } from "../../extend/line/line_geometry";
import { LineMaterial } from "../../extend/line/line_material";
import { LineShaderExt } from "../../extend/line_shader_ext";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PolylineGeometryVisualizer extends BaseGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.polyline;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const points = entity.polyline.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        const ps = [];
        points.forEach(p => ps.push(p.x, p.y, p.z));
        const geometry = new LineGeometry();
        geometry.setPositions(ps);
        const ext = LineShaderExt.extShader();
        ext.uniforms.diffuse.value = new Color("#00ffff");
        const mtl = new LineMaterial({
            color: 0x00ffff,
            linewidth: 5, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            //resolution:  // to be set by renderer, eventually
            dashed: false,
            alphaToCoverage: true,
        });
        const line = new Line2(geometry, mtl);
        line.computeLineDistances();
        line.scale.set(0.1, 0.1, 0.1);
        this._disposableObjects.push(geometry, mtl);
        return line;
    }

}