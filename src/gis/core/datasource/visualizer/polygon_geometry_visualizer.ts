import { Object3D, Event, Shape, Vector2, Mesh, MeshBasicMaterial, DoubleSide, Vector3 } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { ChangableShapeGeometry } from "../../extend/shape/changable_shape_geometry";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PolygonGeometryVisualizer extends BaseGeometryVisualizer {

    private _mesh: Mesh;

    private _geo: ChangableShapeGeometry;

    private _mtl: MeshBasicMaterial;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.polygon;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const polygon = entity.polygon;
        const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
        const shape = new Shape(centerAndPoints.points);
        const geometry = new ChangableShapeGeometry(shape);
        this._geo = geometry;
        const material = new MeshBasicMaterial({
            color: polygon.color,
            side: DoubleSide,
            transparent: true,
            depthTest: false,
            opacity: polygon.opacity
        });
        this._mtl = material;
        const mesh = new Mesh(geometry, material);
        this._mesh = mesh;
        mesh.position.copy(centerAndPoints.center);
        mesh.rotateX(-math.PI_OVER_TWO);
        this._disposableObjects.push(geometry, material);
        return mesh;
    }

    /**
     * 获取中心点和点数据
     * @param entity 
     * @param tilingScheme 
     * @returns 
     */
    private getCenterAndPoints (entity: Entity, tilingScheme: ITilingScheme): { center: Vector3, points: Vector2[] } {
        const polygon = entity.polygon;
        if (polygon.positions.length < 3) {
            return {
                center: VecConstants.ZERO_VEC3.clone(),
                points: []
            }
        } else {
            const points = polygon.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
            const start = points[0];
            const pnts = points.map(point => {
                return new Vector2(point.x - start.x, start.z - point.z);
            });
            return {
                center: start,
                points: pnts
            }
        }
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (propertyChangeData) {
            const polygon = entity.polygon;
            if (propertyChangeData.name === "opacity") {
                this._mtl.opacity = polygon.opacity;
            } else if (propertyChangeData.name === "color") {
                this._mtl.color = polygon.color;
            } else if (propertyChangeData.name === "positions") {
                const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
                const shape = new Shape(centerAndPoints.points);
                this._geo.setShapes(shape);
                this._mesh.position.copy(centerAndPoints.center);
                this._mesh.matrixWorldNeedsUpdate = true;
            }
        }
    }

}