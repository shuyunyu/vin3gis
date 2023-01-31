import { Object3D, Event, Texture, SpriteMaterial, Sprite, PerspectiveCamera } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { billboardGeometryCanvasProvider } from "../../misc/provider/billboard_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    private _sprite?: Sprite;

    private _canvas?: HTMLCanvasElement;

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, renderer: FrameRenderer): Object3D<Event> {
        const billboard = entity.billboard;
        if (!billboard.ready) return null;
        const canvas = billboardGeometryCanvasProvider.createCanvas({
            image: billboard.texImageSource,
            width: billboard.width,
            height: billboard.height,
            center: billboard.center
        });

        this._canvas = canvas;

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

        this._sprite = sprite;
        sprite.position.set(coord.x, coord.y, coord.z);
        this.onRendererSize(entity, renderer);

        this._disposableObjects.push(mtl, texture);

        return sprite;

    }

    public remove (entity: Entity, root: Object3D<Event>): void {
        super.remove(entity, root);
        this._sprite = null;
        this._canvas = null;
    }

    /**
     * resize时 重新设置一下缩放
     * @param renderer 
     * @returns 
     */
    public onRendererSize (entity: Entity, renderer: FrameRenderer) {
        if (!this._sprite) return;
        const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
        const xScale = this._canvas.width * factor / renderer.size.height;
        const yScale = this._canvas.height * factor / renderer.size.height;
        const scale = entity.billboard.scale;
        this._sprite.scale.set(xScale * scale, yScale * scale, 1);
        this._sprite.updateMatrixWorld();
    }

}