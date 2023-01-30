import { Object3D, Event, Texture, SpriteMaterial, Sprite, PerspectiveCamera } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { billboardGeometryCanvasProvider } from "../../misc/provider/billboard_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, renderer: FrameRenderer): Object3D<Event> {
        const billboard = entity.billboard;
        if (!billboard.ready) return null;
        const canvas = billboardGeometryCanvasProvider.createCanvas({
            image: billboard.texImageSource,
            width: billboard.width,
            height: billboard.height,
            center: billboard.center
        });
        const texture = new Texture(canvas);
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
        const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
        const xScale = canvas.width * factor / renderer.size.height;
        const yScale = canvas.height * factor / renderer.size.height;
        sprite.scale.set(xScale, yScale, 1);

        this._disposableObjects.push(mtl, texture);

        return sprite;

    }

}