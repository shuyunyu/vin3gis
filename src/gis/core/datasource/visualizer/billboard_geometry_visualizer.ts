import { Object3D, Event, Texture, LinearFilter, ClampToEdgeWrapping, SpriteMaterial, Sprite } from "three";
import { math } from "../../../../core/math/math";
import { billboardGeometryCanvasProvider } from "../../misc/provider/billboard_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme): Object3D<Event> {
        const billboard = entity.billboard;
        if (!billboard.ready) return null;
        const canvas = billboardGeometryCanvasProvider.createCanvas({
            image: billboard.texImageSource,
            width: billboard.width,
            height: billboard.height,
            center: billboard.center
        });
        const texture = new Texture(canvas);
        texture.minFilter = LinearFilter;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.needsUpdate = true;
        const coord = Transform.cartographicToWorldVec3(billboard.position, tilingScheme);
        const mtl = new SpriteMaterial({
            rotation: billboard.rotation,
            sizeAttenuation: false,
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new Sprite(mtl);
        sprite.position.set(coord.x, coord.y, coord.z);
        sprite.scale.multiplyScalar(0.05 * canvas.width / billboard.width);

        this._disposableObjects.push(mtl, texture);

        return sprite;

    }

}