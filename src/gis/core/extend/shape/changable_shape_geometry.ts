import { BufferGeometry, Float32BufferAttribute, Shape, ShapeUtils } from "three";
import { Utils } from "../../../../core/utils/utils";

/**
 * 可变顶点的ShapeGeometry
 */
export class ChangableShapeGeometry extends BufferGeometry {

    public parameters: { shapes: Shape | Shape[], curveSegments: number | number[] };

    public constructor (shapes?: Shape | Shape[], curveSegments?: number | number[]) {

        super();

        this.type = 'ChangableShapeGeometry';

        this.setShapes(shapes, curveSegments);

    }

    public setShapes (shapes: Shape | Shape[] = [], curveSegments: number | number[] = []) {
        // buffers
        this.parameters = {
            shapes: shapes,
            curveSegments: curveSegments
        };
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];

        // helper variables

        let groupStart = 0;
        let groupCount = 0;

        // allow single and array values for "shapes" parameter

        if (!Array.isArray(shapes)) {
            const _curveSegments = Array.isArray(curveSegments) ? curveSegments[0] : curveSegments;
            addShape(shapes, Utils.defaultValue(_curveSegments, 12));

        } else {

            this.clearGroups();

            if (!Array.isArray(curveSegments)) {
                curveSegments = [curveSegments];
            }

            for (let i = 0; i < shapes.length; i++) {

                addShape(shapes[i], Utils.defaultValue(curveSegments[i], 12));

                // this.addGroup(groupStart, groupCount, i); // enables MultiMaterial support

                groupStart += groupCount;
                groupCount = 0;

            }

        }

        // build geometry

        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));


        // helper functions

        function addShape (shape, _curveSegments) {

            const indexOffset = vertices.length / 3;
            const points = shape.extractPoints(_curveSegments);

            let shapeVertices = points.shape;
            const shapeHoles = points.holes;

            // check direction of vertices

            if (ShapeUtils.isClockWise(shapeVertices) === false) {

                shapeVertices = shapeVertices.reverse();

            }

            for (let i = 0, l = shapeHoles.length; i < l; i++) {

                const shapeHole = shapeHoles[i];

                if (ShapeUtils.isClockWise(shapeHole) === true) {

                    shapeHoles[i] = shapeHole.reverse();

                }

            }

            const faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

            // join vertices of inner and outer paths to a single array

            for (let i = 0, l = shapeHoles.length; i < l; i++) {

                const shapeHole = shapeHoles[i];
                shapeVertices = shapeVertices.concat(shapeHole);

            }

            // vertices, normals, uvs

            for (let i = 0, l = shapeVertices.length; i < l; i++) {

                const vertex = shapeVertices[i];

                vertices.push(vertex.x, vertex.y, 0);
                normals.push(0, 0, 1);
                uvs.push(vertex.x, vertex.y); // world uvs

            }

            // indices

            for (let i = 0, l = faces.length; i < l; i++) {

                const face = faces[i];

                const a = face[0] + indexOffset;
                const b = face[1] + indexOffset;
                const c = face[2] + indexOffset;

                indices.push(a, b, c);
                groupCount += 3;

            }

        }
    }

    copy (source) {

        super.copy(source);

        this.parameters = Object.assign({}, source.parameters);

        return this;

    }

    toJSON () {

        const data = super.toJSON();

        const shapes = this.parameters.shapes;

        return toJSON(shapes, data);

    }

    static fromJSON (data, shapes) {

        const geometryShapes = [];

        for (let j = 0, jl = data.shapes.length; j < jl; j++) {

            const shape = shapes[data.shapes[j]];

            geometryShapes.push(shape);

        }

        return new ChangableShapeGeometry(geometryShapes, data.curveSegments);

    }

}

function toJSON (shapes, data) {

    data.shapes = [];

    if (Array.isArray(shapes)) {

        for (let i = 0, l = shapes.length; i < l; i++) {

            const shape = shapes[i];

            data.shapes.push(shape.uuid);

        }

    } else {

        data.shapes.push(shapes.uuid);

    }

    return data;

}