import { Object3D, Event, Color, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PointCloudGeometryVisualizer extends BaseGeometryVisualizer {

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D<Event> {
        const pointCloud = entity.pointClound;
        const coordArray = pointCloud.positions.map(pos => Transform.cartographicToWorldVec3(pos, tilingScheme));
        const defaultColor = new Color();
        const coords = [];
        const colors = [];
        coordArray.forEach((coord, index) => {
            coords.push(coord.x, coord.y, coord.z);
            const color = pointCloud.colors[index] || defaultColor;
            colors.push(color.r, color.g, color.b);
        });
        const vertices = new Float32Array(coords);
        const color = new Float32Array(colors);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(color, 3));
        const mtl = new PointsMaterial({
            side: pointCloud.size,
            sizeAttenuation: pointCloud.sizeAttenuation,
            transparent: true,
            depthTest: false,
            vertexColors: true
        });
        const pts = new Points(geometry, mtl);

        this._disposableObjects.push(geometry, mtl);

        return pts;
    }

}