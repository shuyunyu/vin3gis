import { BufferAttribute, BufferGeometry } from "three";

/**
 * 瓦片geometry工厂
 */
export class TileGeometryFactory {

    /**
     * 创建瓦片geometry
     */
    public static createGeometry () {
        const geometry = new BufferGeometry();
        const position = new Float32Array([
            -1, 0, -1,
            -1, 0, 1,
            1, 0, 1,
            1, 0, -1
        ]);
        const indexs = [0, 1, 2, 2, 3, 0];
        const normals = new Float32Array([
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]);
        const uvs = new Float32Array([
            -1, -1,
            -1, 1,
            1, 1,
            1, -1
        ]);
        geometry.setAttribute('position', new BufferAttribute(position, 3));
        geometry.setIndex(indexs);
        geometry.setAttribute('normal', new BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
        return geometry;
    }

}