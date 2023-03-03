import { Object3D, Event, Shape, Vector2, Mesh, MeshBasicMaterial, DoubleSide, Vector3, Path, Material, MeshLambertMaterial, Color } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Utils } from "../../../../core/utils/utils";
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
        const shapes = this.getShapes(entity, centerAndPoints);
        const geometry = polygon.extrudedHeight ? new ChangableExtrudedGeometry(shapes, this.getExtrudedGeometryOptions(entity, shapes)) : new ChangableShapeGeometry(shapes);
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
            emissive: polygon.emissive,
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
    private getCenterAndPoints (entity: Entity, tilingScheme: ITilingScheme): { center: Vector3, points: Vector2[][], holes?: Path[][] } {
        const polygon = entity.polygon;
        const holesArray = polygon.shapes.map(shape => shape.holes);
        const positionsArray = polygon.shapes.map(shape => shape.positions);
        let start: Vector3;
        const resPoints: Vector2[][] = [];
        const resHoles: Path[][] = [];
        for (let i = 0; i < positionsArray.length; i++) {
            const positions = positionsArray[i];
            if (positions.length < 3) {
                continue;
            } else {
                const points = positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
                if (!start) {
                    start = points[0];
                }
                const pnts = points.map(point => {
                    return new Vector2(point.x - start.x, start.z - point.z);
                });

                let holes: Path[];
                const cHoles = holesArray[i];
                if (cHoles && cHoles.length) {
                    const holesPoints = cHoles.map(hole => {
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

                resPoints[i] = pnts;
                resHoles[i] = holes && holes.length ? holes : null;
            }
        }

        return start ? {
            center: start,
            points: resPoints,
            holes: resHoles
        } : {
            center: VecConstants.ZERO_VEC3,
            points: [],
            holes: []
        }
    }

    private getShapes (entity: Entity, centerAndPoints: any) {
        const shapes: Shape[] = [];
        for (let i = 0; i < centerAndPoints.points.length; i++) {
            const points = centerAndPoints.points[i];
            if (points.length) {
                const shape = new Shape(points);
                const holes = centerAndPoints.holes[i];
                if (holes && holes.length) {
                    shape.holes = holes;
                }
                shapes.push(shape);
            }
        }
        return shapes;
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
     * @param shapes
     * @returns 
     */
    private getExtrudedGeometryOptions (entity: Entity, shapes: Shape[]): ExtrudedGeometryOptions {
        const polygon = entity.polygon;
        const depths = [];
        const colors = [];
        const opacities = [];
        const heights = [];
        const defaultColor = new Color();
        const emissives = [];
        const effectedByLights = [];
        const defaultEmissive = new Color(0x000000);
        const uvGenerators = [];
        shapes.forEach((_, index) => {
            depths.push(Transform.carCoordToWorldCoord(Math.max(Utils.defaultValue(polygon.extrudedHeight, 0))));
            colors.push(Utils.defaultValue(polygon.color, defaultColor));
            opacities.push(math.clamp(Utils.defaultValue(polygon.opacity, 1), 0, 1));
            heights.push(Utils.defaultValue(polygon.height, 0));
            emissives.push(Utils.defaultValue(polygon.emissive, defaultEmissive));
            effectedByLights.push(Utils.defaultValue(polygon.effectedByLight, false));
            uvGenerators.push(polygon.uvGenerator);
        });
        return {
            bevelEnabled: false,
            instanceDepths: depths,
            instanceColors: colors,
            instanceOpacities: opacities,
            instanceHeights: heights,
            instanceEmissive: emissives,
            instanceEffectByLight: effectedByLights,
            instanceUVGenerators: uvGenerators
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
            } else if (propertyChangeData.name === "positions" || propertyChangeData.name === "holes" || propertyChangeData.name === "uvGenerator" || propertyChangeData.name === "extrudedHeight") {
                const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
                const shapes = this.getShapes(entity, centerAndPoints);
                let geometryChanged = false;
                if (propertyChangeData.name === "extrudedHeight") {
                    if (propertyChangeData.nextVal) {
                        if (!(this._geo instanceof ChangableExtrudedGeometry)) {
                            this.manualDisposableObjects([this._geo]);
                            this._geo = new ChangableExtrudedGeometry(shapes, this.getExtrudedGeometryOptions(entity, shapes));
                            this._mesh.geometry = this._geo;
                            this._disposableObjects.push(this._geo);
                            geometryChanged = true;
                        }
                    } else {
                        if (!(this._geo instanceof ChangableShapeGeometry)) {
                            this.manualDisposableObjects([this._geo]);
                            this._geo = new ChangableShapeGeometry(shapes);
                            this._mesh.geometry = this._geo;
                            this._disposableObjects.push(this._geo);
                            geometryChanged = true;
                        }
                    }
                }
                if (!geometryChanged) {
                    if (this._geo instanceof ChangableShapeGeometry) {
                        this._geo.setShapes(shapes, this._geo.parameters.curveSegments);
                    } else {
                        this._geo.setShapes(shapes, this.getExtrudedGeometryOptions(entity, shapes));
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
            } else if (propertyChangeData.name === "emissive") {
                if (this._mtl instanceof MeshLambertMaterial) {
                    this._mtl.emissive = polygon.emissive;
                }
            }
        }
    }

}