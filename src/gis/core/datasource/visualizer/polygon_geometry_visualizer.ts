import { Object3D, Event, Shape, Vector2, Mesh, MeshBasicMaterial, DoubleSide, Vector3, Path, Material, MeshLambertMaterial } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
import { ChangableExtrudedGeometry, ExtrudedGeometryOptions } from "../../extend/shape/changable_extruded_geometry";
import { ChangableShapeGeometry } from "../../extend/shape/changable_shape_geometry";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PolygonGeometryVisualizer extends BaseGeometryVisualizer {

    private _mesh: Mesh;

    private _geo: ChangableShapeGeometry | ChangableExtrudedGeometry;

    private _mtl: Material;

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
        const geometry = polygon.extrudedHeight ? new ChangableExtrudedGeometry(shape, this.getExtrudedGeometryOptions(entity)) : new ChangableShapeGeometry(shape);
        this._geo = geometry;
        const material = this.getMaterial(entity);
        this._mtl = material;
        const mesh = new Mesh(geometry, material);
        this._mesh = mesh;
        mesh.position.copy(centerAndPoints.center);
        mesh.rotateX(-math.PI_OVER_TWO);
        this._disposableObjects.push(geometry, material);
        return mesh;
    }

    private getMaterial (entity: Entity) {
        const polygon = entity.polygon;
        return polygon.material || polygon.effectedByLight ? new MeshLambertMaterial({
            color: polygon.color,
            side: DoubleSide,
            transparent: true,
            depthTest: false,
            opacity: polygon.opacity
        }) : new MeshBasicMaterial({
            color: polygon.color,
            side: DoubleSide,
            transparent: true,
            depthTest: false,
            opacity: polygon.opacity
        })
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

    /**
     * 获取ExtrudedGeometry的构成参数
     * @param entity 
     * @returns 
     */
    private getExtrudedGeometryOptions (entity: Entity): ExtrudedGeometryOptions {
        return {
            depth: Transform.carCoordToWorldCoord(entity.polygon.extrudedHeight),
            bevelEnabled: false,
            steps: 1
        }
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (propertyChangeData) {
            const polygon = entity.polygon;
            if (propertyChangeData.name === "opacity") {
                this._mtl.opacity = polygon.opacity;
            } else if (propertyChangeData.name === "color") {
                if (this._mtl.hasOwnProperty("color")) {
                    //@ts-ignore
                    this._mtl.color = polygon.color;
                }
            } else if (propertyChangeData.name === "positions" || propertyChangeData.name === "holes" || propertyChangeData.name === "extrudedHeight") {
                const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
                const shape = new Shape(centerAndPoints.points);
                if (centerAndPoints.holes) {
                    shape.holes = centerAndPoints.holes;
                }
                let geometryChanged = false;
                if (propertyChangeData.name === "extrudedHeight") {
                    if (propertyChangeData.nextVal) {
                        if (!(this._geo instanceof ChangableExtrudedGeometry)) {
                            this.manualDisposableObjects([this._geo]);
                            this._geo = new ChangableExtrudedGeometry(shape, this.getExtrudedGeometryOptions(entity));
                            this._mesh.geometry = this._geo;
                            this._disposableObjects.push(this._geo);
                            geometryChanged = true;
                        }
                    } else {
                        if (!(this._geo instanceof ChangableShapeGeometry)) {
                            this.manualDisposableObjects([this._geo]);
                            this._geo = new ChangableShapeGeometry(shape);
                            this._mesh.geometry = this._geo;
                            this._disposableObjects.push(this._geo);
                            geometryChanged = true;
                        }
                    }
                }
                if (!geometryChanged) {
                    if (this._geo instanceof ChangableShapeGeometry) {
                        this._geo.setShapes(shape, this._geo.parameters.curveSegments);
                    } else {
                        this._geo.setShapes(shape, this.getExtrudedGeometryOptions(entity));
                    }
                }
                this._mesh.position.copy(centerAndPoints.center);
                this._mesh.matrixWorldNeedsUpdate = true;
            } else if (propertyChangeData.name === "height") {
                this._mesh.position.y = this.getWorldHeight(entity, tilingScheme);
                this._mesh.matrixWorldNeedsUpdate = true;
            } else if (propertyChangeData.name === "material") {
                this._mesh.material = polygon.material;
                this.manualDisposableObjects([this._mtl]);
                this._disposableObjects.push(this._mtl);
                this._mtl = this._mesh.material;
            } else if (propertyChangeData.name === "effectedByLight") {
                const mtl = this.getMaterial(entity);
                if (this._mtl !== mtl) {
                    this.manualDisposableObjects([this._mtl]);
                    this._disposableObjects.push(this._mtl);
                    this._mesh.material = mtl;
                    this._mtl = mtl;
                }
            }
        }
    }

}