import { Object3D, Event, Vector2, Color } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
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

    private _geo: LineGeometry;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.polyline;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const points = entity.polyline.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        const color = entity.polyline.color;
        const ps = [];
        points.forEach(p => {
            ps.push(p.x, p.y, p.z);
        });
        const colors = this.getColorData(entity, color);
        const geometry = new LineGeometry();
        geometry.setPositions(ps);
        geometry.setColors(colors);
        this._geo = geometry;
        const mtl = new LineMaterial({
            color: 0xffffff,
            linewidth: entity.polyline.width, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            //resolution:  // to be set by renderer, eventually
            resolution: new Vector2(renderer.size.width, renderer.size.height),
            dashed: false,
            alphaToCoverage: true,
        });
        const line = new Line2(geometry, mtl);
        this._mtl = mtl;
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        this._disposableObjects.push(geometry, mtl);
        return line;
    }

    /**
     * 获取颜色数据
     * @param entity 
     * @param color 
     * @returns 
     */
    private getColorData (entity: Entity, color: Color) {
        const polyline = entity.polyline;
        const points = polyline.positions;
        const colors = [];
        points.forEach(p => {
            colors.push(color.r, color.g, color.b);
        });
        return colors;
    }

    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        this.update(entity, tilingScheme, root, renderer);
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        const polyline = entity.polyline;
        this._mtl.resolution = new Vector2(renderer.size.width, renderer.size.height);
        if (propertyChangeData.name === "color") {
            const colors = this.getColorData(entity, polyline.color);
            this._geo.setColors(colors);
        } else if (propertyChangeData.name === "width") {
            this._mtl.linewidth = polyline.width;
        }
    }

}