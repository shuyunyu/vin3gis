import { Object3D, Event, Texture, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D<Event> {
        const billboard = entity.billboard;
        if (!billboard.ready) return null;
        const texture = new Texture(billboard.texImageSource);
        texture.needsUpdate = true;
        const coord = Transform.cartographicToWorldVec3(billboard.position, tilingScheme);
        const vertices = new Float32Array([coord.x, coord.y, coord.z]);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        const mtl = new PointsMaterial({
            size: Math.max(billboard.width, billboard.height),
            sizeAttenuation: false,
            map: texture,
            transparent: true,
            depthTest: false
        });
        const pts = new Points(geometry, mtl);

        this._disposableObjects.push(geometry, mtl, texture);

        return pts;

    }

}