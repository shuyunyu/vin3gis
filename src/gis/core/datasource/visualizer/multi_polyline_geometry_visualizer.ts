import { Object3D, Event, Color, Vector2 } from "three";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { Line2 } from "../../extend/line/line2";
import { LineMaterial } from "../../extend/line/line_material";
import { MultiLineGeometry } from "../../extend/line/multi_line_geometry";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class MultiPolylineGeometryVisualizer extends BaseGeometryVisualizer {

    private _mtl: LineMaterial;

    private _geo: MultiLineGeometry;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPolyline;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const multiPolyline = entity.multiPolyline;
        const geometry = new MultiLineGeometry();
        geometry.setPositions(this.getPositionData(entity, tilingScheme));
        geometry.setColors(this.getColorData(entity));
        geometry.setLinewidths(this.getLinewidthsData(entity, entity.multiPolyline.widths))
        this._geo = geometry;
        const mtl = new LineMaterial({
            color: 0xffffff,
            linewidth: 1, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            //resolution:  // to be set by renderer, eventually
            resolution: new Vector2(renderer.size.width, renderer.size.height),
            dashed: false,
            alphaToCoverage: true,
            opacity: 1
        });
        //@ts-ignore
        const line = new Line2(geometry, mtl);
        this._mtl = mtl;
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        this._disposableObjects.push(geometry, mtl);
        return line;
    }

    /**
     * 获取位置顶点数据
     * @param entity 
     * @param tilingScheme 
     * @returns 
     */
    private getPositionData (entity: Entity, tilingScheme: ITilingScheme) {
        const pointsArray = entity.multiPolyline.positions.map(posArr => {
            return posArr.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        });
        const psArray = [];
        for (let i = 0; i < pointsArray.length; i++) {
            const array = pointsArray[i];
            const ps = [];
            for (let j = 0; j < array.length; j++) {
                const val = array[j];
                ps.push(val.x, val.y, val.z);
            }
            psArray.push(ps);
        }
        return psArray;
    }

    /**
     * 获取颜色数据
     * @param entity 
     * @param color 
     * @returns 
     */
    private getColorData (entity: Entity) {
        const multiPolyline = entity.multiPolyline;
        const points = multiPolyline.positions;
        const colorsArray: number[][] = [];
        const defaultColor = new Color();
        const colors = multiPolyline.colors;
        points.forEach((ps, index) => {
            const ccolors: number[] = [];
            const useVertexColor = multiPolyline.useVertexColor[index];
            if (useVertexColor) {
                const cVertexColors = multiPolyline.vertexColors[index];
                ps.forEach((p, i) => {
                    const color = cVertexColors[i] || defaultColor;
                    ccolors.push(color.r, color.g, color.b);
                })
            } else {
                const color = colors[index] || defaultColor
                ps.forEach(p => {
                    ccolors.push(color.r, color.g, color.b);
                })
            }
            colorsArray.push(ccolors);
        });
        return colorsArray;
    }

    /**
     * 获取颜色数据
     * @param entity 
     * @param color 
     * @returns 
     */
    private getLinewidthsData (entity: Entity, linewidths: number[]) {
        const multiPolyline = entity.multiPolyline;
        const points = multiPolyline.positions;
        const widthsArray: number[][] = [];
        points.forEach((ps, index) => {
            const wds: number[] = [];
            ps.forEach(p => {
                wds.push(linewidths[index] || 1);
            })
            widthsArray.push(wds);
        });
        return widthsArray;
    }


    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        this.update(entity, tilingScheme, root, renderer);
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        this._mtl.resolution = new Vector2(renderer.size.width, renderer.size.height);
        if (propertyChangeData) {
            const multiPolyline = entity.multiPolyline;
            if (propertyChangeData.name === "positions") {
                this._geo.setPositions(this.getPositionData(entity, tilingScheme));
            } else if (propertyChangeData.name === "colors" || propertyChangeData.name === "useVertexColor" || propertyChangeData.name === "vertexColors") {
                this._geo.setColors(this.getColorData(entity));
            } else if (propertyChangeData.name === "widths") {
                this._geo.setLinewidths(this.getLinewidthsData(entity, multiPolyline.widths));
            }
        }
    }

}