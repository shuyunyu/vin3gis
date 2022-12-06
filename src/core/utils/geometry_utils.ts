import { BufferGeometry } from "three";

export class GeometryUtils {

    /**
     * 计算geometry的字节数
     * @param geometry 
     * @returns 
     */
    public static getGeometryByteLength (geometry: BufferGeometry) {

        let total = 0;

        //@ts-ignore
        if (geometry.index) total += geometry.index.array.byteLength;

        for (const name in geometry.attributes) {
            //@ts-ignore
            total += geometry.attributes[name].array.byteLength;

        }

        return total;

    }
}