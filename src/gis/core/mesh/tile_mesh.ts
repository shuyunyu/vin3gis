import { Rectangle } from "../geometry/rectangle";

export class TileMesh {

    /**
     * 创建瓦片mesh
     * @param textureNativeRectangle 贴图矩形范围
     * @param tileNativeRectangle 瓦片对应的矩形范围
     */
    public createTileMesh (textureNativeRectangle: Rectangle, tileNativeRectangle: Rectangle) {
        let center = tileNativeRectangle.center;
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        // let uvs: number[] = [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0];
        let uvs = this.calcUvs(textureNativeRectangle, tileNativeRectangle);

        let xmin = tileNativeRectangle.west - center.x;
        let ymin = tileNativeRectangle.south - center.y;
        let xmax = tileNativeRectangle.east - center.x;
        let ymax = tileNativeRectangle.north - center.y;

        let y = center.z;

        positions.push(xmin, y, ymin);
        positions.push(xmin, y, ymax);
        positions.push(xmax, y, ymax);
        positions.push(xmax, y, ymax);
        positions.push(xmax, y, ymin);
        positions.push(xmin, y, ymin);

        indices.push(0, 1, 2, 3, 4, 5);

        normals.push(0, 1, 0, 0, 1, 0);


    }

    /**
     * 计算uvs
     * @param textureRectangle 贴图对应的矩形范围
     * @param tileRectangle 瓦片节点对应的矩形范围
     */
    private calcUvs (textureRectangle: Rectangle, tileRectangle: Rectangle) {
        let width = textureRectangle.width;
        let height = textureRectangle.height;
        let xmin = (tileRectangle.west - textureRectangle.west) / width;
        let xmax = (tileRectangle.east - textureRectangle.west) / width;
        let ymin = (textureRectangle.north - tileRectangle.north) / height;
        let ymax = (textureRectangle.north - tileRectangle.south) / height;
        return [xmin, ymin, xmin, ymax, xmax, ymax, xmax, ymax, xmax, ymin, xmin, ymin];
    }

}
