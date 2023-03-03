import { Object3D, Event, Vector2, Path, Vector3, Shape, DoubleSide, Mesh, Color, MeshLambertMaterial } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Utils } from "../../../../core/utils/utils";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { PolygonShaderExt } from "../../extend/polygon_shader_ext";
import { ChangableExtrudedGeometry, ExtrudedGeometryOptions } from "../../extend/shape/changable_extruded_geometry";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class MultiPolygonGeometryViauzlizer extends BaseGeometryVisualizer {

    private _geo: ChangableExtrudedGeometry;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPolygon;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
        const shapesArray = this.getShapes(entity, centerAndPoints);
        const shapes = [];
        shapesArray.forEach(sps => {
            shapes.push(...sps);
        });
        const geometry = new ChangableExtrudedGeometry(shapes, this.getExtrudedGeometryOptions(entity, shapesArray));
        this._geo = geometry;
        const ext = PolygonShaderExt.extShader();
        const material = new MeshLambertMaterial({
            transparent: true,
            depthTest: false,
            side: DoubleSide,
            //@ts-ignore
            onBeforeCompile: (shader: Shader, renderer: WebGLRenderer) => {
                shader.vertexShader = ext.vertexShader;
                shader.fragmentShader = ext.fragmentShader;
            }
        });
        const mesh = new Mesh(geometry, material);
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
    private getCenterAndPoints (entity: Entity, tilingScheme: ITilingScheme): { center: Vector3, shapeData: { points: Vector2[][], holes: Path[][] }[] } {
        let start: Vector3;
        const multiPolygon = entity.multiPolygon;
        const shapeData = [];
        multiPolygon.shapes.forEach(shapes => {
            const positionArray = shapes.map(shape => shape.positions);
            const holesArray = shapes.map(shape => shape.holes);
            const resPoints: Vector2[][] = [];
            const resHoles: Path[][] = [];
            for (let i = 0; i < positionArray.length; i++) {
                const positions = positionArray[i];
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

            shapeData.push({
                points: resPoints,
                holes: resHoles
            });
        });

        return start ? {
            center: start,
            shapeData: shapeData
        } : {
            center: VecConstants.ZERO_VEC3,
            shapeData: []
        }

    }

    private getShapes (entity: Entity, centerAndPoints: any): Shape[][] {
        const shapes: Shape[][] = [];
        for (let i = 0; i < centerAndPoints.shapeData.length; i++) {
            const shapeArray = [];
            const shapeData = centerAndPoints.shapeData[i];
            for (let i = 0; i < shapeData.points.length; i++) {
                const points = shapeData.points[i];
                if (points.length) {
                    const shape = new Shape(points);
                    const holes = shapeData.holes[i];
                    if (holes && holes.length) {
                        shape.holes = holes;
                    }
                    shapeArray.push(shape);
                }
            }
            shapes.push(shapeArray);
        }
        return shapes;
    }

    /**
     * 获取ExtrudedGeometry的构成参数
     * @param entity 
     * @param shapes
     * @returns 
     */
    private getExtrudedGeometryOptions (entity: Entity, shapes: Shape[][]): ExtrudedGeometryOptions {
        const multiPolygon = entity.multiPolygon;
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
            _.forEach(__ => {
                depths.push(Transform.carCoordToWorldCoord(Math.max(Utils.defaultValue(multiPolygon.extrudedHeights[index], 0))));
                colors.push(Utils.defaultValue(multiPolygon.colors[index], defaultColor));
                opacities.push(math.clamp(Utils.defaultValue(multiPolygon.opacities[index], 1), 0, 1));
                heights.push(Utils.defaultValue(multiPolygon.heights[index], 0));
                emissives.push(Utils.defaultValue(multiPolygon.emissives[index], defaultEmissive));
                effectedByLights.push(Utils.defaultValue(multiPolygon.effectedByLights[index], false));
                uvGenerators.push(multiPolygon.uvGenerators[index]);
            })
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
            const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
            const shapesArray = this.getShapes(entity, centerAndPoints);
            const shapes = [];
            shapesArray.forEach(sps => {
                shapes.push(...sps);
            });
            const options = this.getExtrudedGeometryOptions(entity, shapesArray);
            this._geo.setShapes(shapes, options);
        }
    }

}