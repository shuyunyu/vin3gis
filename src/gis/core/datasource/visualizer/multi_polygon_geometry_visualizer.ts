import { Object3D, Event, Vector2, Path, Vector3, Shape, Color, DoubleSide, MeshBasicMaterial, Mesh } from "three";
import { VecConstants } from "../../../../core/constants/vec_constants";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { ChangableExtrudedGeometry } from "../../extend/shape/changable_extruded_geometry";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class MultiPolygonGeometryViauzlizer extends BaseGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.multiPolygon;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const centerAndPoints = this.getCenterAndPoints(entity, tilingScheme);
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
        const geometry = new ChangableExtrudedGeometry(shapes, {
            bevelEnabled: false,
            depth: 0
        });
        const material = new MeshBasicMaterial({
            color: new Color("#FF0000"),
            side: DoubleSide,
            transparent: true,
            depthTest: false,
            opacity: 1
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
    private getCenterAndPoints (entity: Entity, tilingScheme: ITilingScheme): { center: Vector3, points: Vector2[][], holes: Path[][] } {
        const multiPolygon = entity.multiPolygon;
        const holesArray = multiPolygon.holes;
        let start: Vector3;
        const resPoints: Vector2[][] = [];
        const resHoles: Path[][] = [];
        for (let i = 0; i < multiPolygon.positions.length; i++) {
            const positions = multiPolygon.positions[i];
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

                // start.y = this.getWorldHeight(entity, tilingScheme);
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

}