import { Object3D, Event, Texture, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, SpriteMaterial, Sprite, PerspectiveCamera } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BasePointGeometry } from "../geometry/base_point_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PointGeometryVisualizer extends BaseGeometryVisualizer {

    private _sprite?: Sprite;

    private _canvas?: HTMLCanvasElement;


    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.point;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer): Object3D<Event> {
        const basePointGeometry = this.getEntityGeometry(entity) as BasePointGeometry;
        const fullSize = basePointGeometry.outline ? basePointGeometry.size + basePointGeometry.outlineSize : basePointGeometry.size;
        const canvas = pointGeometryCanvasProvider.createCanvas({
            canvasSize: fullSize,
            size: basePointGeometry.size,
            color: basePointGeometry.color,
            outline: basePointGeometry.outline,
            outlineSize: basePointGeometry.outlineSize,
            outlineColor: basePointGeometry.outlineColor
        });
        this._canvas = canvas;
        const texture = new Texture(canvas);
        texture.needsUpdate = true;
        const mtl = new SpriteMaterial({
            sizeAttenuation: false,
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new Sprite(mtl);
        this._sprite = sprite;
        this.update(entity, tilingScheme, root, renderer);

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
    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) {
        this.update(entity, tilingScheme, root, renderer);
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (!this._sprite) return;
        const coord = Transform.cartographicToWorldVec3(entity.point.position, tilingScheme);
        const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
        const xScale = this._canvas.width * factor / renderer.size.height;
        const yScale = this._canvas.height * factor / renderer.size.height;
        //set scale
        this._sprite.scale.set(xScale, yScale, 1);
        //set position
        this._sprite.position.set(coord.x, coord.y, coord.z);
        this._sprite.material.needsUpdate = true;
        this._sprite.updateMatrixWorld();

    }

}