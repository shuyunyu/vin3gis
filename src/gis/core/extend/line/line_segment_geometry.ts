import { Box3, Float32BufferAttribute, InstancedBufferGeometry, InstancedInterleavedBuffer, InterleavedBufferAttribute, Matrix4, Sphere, Vector3, WireframeGeometry } from "three";

const _box = new Box3();
const _vector = new Vector3();

export class LineSegmentsGeometry extends InstancedBufferGeometry {

    public readonly isLineSegmentsGeometry: boolean;

    public constructor () {
        super();
        this.isLineSegmentsGeometry = true;
        this.type = "LineSegmentsGeometry";
        const positions = [- 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0];
        const uvs = [- 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2];
        const index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];

        this.setIndex(index);
        this.setAttribute('position', new Float32BufferAttribute(positions, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    }

    public applyMatrix4 (matrix: Matrix4) {

        const start = this.attributes.instanceStart;
        const end = this.attributes.instanceEnd;

        if (start !== undefined) {

            start.applyMatrix4(matrix);

            end.applyMatrix4(matrix);

            start.needsUpdate = true;

        }

        if (this.boundingBox !== null) {

            this.computeBoundingBox();

        }

        if (this.boundingSphere !== null) {

            this.computeBoundingSphere();

        }

        return this;

    }

    public setPositions (array: Float32Array | number[]) {

        let lineSegments;

        if (array instanceof Float32Array) {

            lineSegments = array;

        } else if (Array.isArray(array)) {

            lineSegments = new Float32Array(array);

        }

        const instanceBuffer = new InstancedInterleavedBuffer(lineSegments, 6, 1); // xyz, xyz

        this.setAttribute('instanceStart', new InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz
        this.setAttribute('instanceEnd', new InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz

        //

        this.computeBoundingBox();
        this.computeBoundingSphere();

        return this;

    }

    public setColors (array: Float32Array | number[]) {

        let colors;

        if (array instanceof Float32Array) {

            colors = array;

        } else if (Array.isArray(array)) {

            colors = new Float32Array(array);

        }

        const instanceColorBuffer = new InstancedInterleavedBuffer(colors, 6, 1); // rgb, rgb

        this.setAttribute('instanceColorStart', new InterleavedBufferAttribute(instanceColorBuffer, 3, 0)); // rgb
        this.setAttribute('instanceColorEnd', new InterleavedBufferAttribute(instanceColorBuffer, 3, 3)); // rgb

        return this;

    }

    public setLinewidths (linewidthArray: Float32Array | number[]) {
        let linewidths;
        if (linewidthArray instanceof Float32Array) {
            linewidths = linewidthArray;
        } else if (Array.isArray(linewidthArray)) {
            linewidths = new Float32Array(linewidthArray);
        }
        const instanceLinewidthBuffer = new InstancedInterleavedBuffer(linewidths, 2, 1);
        this.setAttribute('instanceLinewidth', new InterleavedBufferAttribute(instanceLinewidthBuffer, 1, 0));

        return this;
    }

    /**
     * 设置dash相关的参数
     * @param dashArgsArr 
     */
    public setDashArguments (dashArgsArr: Float32Array | number[]) {
        let dashArgs;
        if (dashArgsArr instanceof Float32Array) {
            dashArgs = dashArgsArr;
        } else if (Array.isArray(dashArgsArr)) {
            dashArgs = new Float32Array(dashArgsArr);
        }
        const instanceDashArgsBuffer = new InstancedInterleavedBuffer(dashArgs, 8, 1);
        this.setAttribute('instanceDashArgs', new InterleavedBufferAttribute(instanceDashArgsBuffer, 4, 0));

        return this;
    }

    public fromWireframeGeometry (geometry) {

        this.setPositions(geometry.attributes.position.array);

        return this;

    }

    public fromEdgesGeometry (geometry) {

        this.setPositions(geometry.attributes.position.array);

        return this;

    }

    public fromMesh (mesh) {

        this.fromWireframeGeometry(new WireframeGeometry(mesh.geometry));

        // set colors, maybe

        return this;

    }

    public fromLineSegments (lineSegments) {

        const geometry = lineSegments.geometry;

        this.setPositions(geometry.attributes.position.array); // assumes non-indexed

        // set colors, maybe

        return this;

    }

    public computeBoundingBox () {

        if (this.boundingBox === null) {

            this.boundingBox = new Box3();

        }

        const start = this.attributes.instanceStart;
        const end = this.attributes.instanceEnd;

        if (start !== undefined && end !== undefined) {

            //@ts-ignore
            this.boundingBox.setFromBufferAttribute(start);

            //@ts-ignore
            _box.setFromBufferAttribute(end);

            this.boundingBox.union(_box);

        }

    }

    public computeBoundingSphere () {

        if (this.boundingSphere === null) {

            this.boundingSphere = new Sphere();

        }

        if (this.boundingBox === null) {

            this.computeBoundingBox();

        }

        const start = this.attributes.instanceStart;
        const end = this.attributes.instanceEnd;

        if (start !== undefined && end !== undefined) {

            const center = this.boundingSphere.center;

            this.boundingBox.getCenter(center);

            let maxRadiusSq = 0;

            for (let i = 0, il = start.count; i < il; i++) {

                _vector.fromBufferAttribute(start, i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

                _vector.fromBufferAttribute(end, i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

            }

            this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

            if (isNaN(this.boundingSphere.radius)) {

                console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);

            }

        }

    }

    public toJSON () {

        // todo

    }

    public applyMatrix (matrix: Matrix4) {

        console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().');

        return this.applyMatrix4(matrix);

    }

}