import { Object3D, Event, Shape, Vector2, Mesh, MeshBasicMaterial, DoubleSide, Vector3, Path } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
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
        if (centerAndPoints.holes) {
            shape.holes = centerAndPoints.holes;
        }
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
    private getCenterAndPoints (entity: Entity, tilingScheme: ITilingScheme): { center: Vector3, points: Vector2[], holes?: Path[] } {
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

            let holes: Path[];

            if (polygon.holes) {
                const holesPoints = polygon.holes.map(hole => {
                    return hole.map(pos => {
                        const point = Transform.cartographicToWorldVec3(pos, tilingScheme);
                        return new Vector2(point.x - start.x, start.z - point.z);
                    });
                });
                holes = [];
                holesPoints.forEach(holePoints => {
                    if (holePoints.length) {
                        holes.push(new Path(holePoints));
                    }
                });
            }

            start.y = this.getWorldHeight(entity, tilingScheme);
            return {
                center: start,
                points: pnts,
                holes: holes && holes.length ? holes : null
            }
        }
    }

    /**
     * 获取polygon的世界高度
     * @param entity 
     * @param tilingScheme 
     * @returns 
     */
    private getWorldHeight (entity: Entity, tilingScheme: ITilingScheme) {
        const hPoint = Transform.cartographicToWorldVec3(Cartographic.fromDegrees(0, 0, entity.polygon.height), tilingScheme);
        return hPoint.y;
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (propertyChangeData) {
            const polygon = entity.polygon;
            if (propertyChangeData.name === "opacity") {
                this._mtl.opacity = polygon.opacity;
            } else if (propertyChangeData.name === "color") {
                this._mtl.color = polygon.color;
            } else if (propertyChangeData.name === "positions" || propertyChangeData.name === "holes") {
                const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
                const shape = new Shape(centerAndPoints.points);
                if (centerAndPoints.holes) {
                    shape.holes = centerAndPoints.holes;
                }
                this._geo.setShapes(shape);
                this._mesh.position.copy(centerAndPoints.center);
                this._mesh.matrixWorldNeedsUpdate = true;
            } else if (propertyChangeData.name === "height") {
                this._mesh.position.y = this.getWorldHeight(entity, tilingScheme);
                this._mesh.matrixWorldNeedsUpdate = true;
            }
        }
    }

}