import { Event, Object3D, Vector2 } from "three";
import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/msic/size";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { ICartesian2Like } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { SpriteTextureAtlas } from "../atlas/sprite_texture_atlas";
import { spriteTextureAtlasManager } from "../atlas/sprite_texture_atlas_manager";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class SpriteAtlasGeometryVisualizer extends BaseGeometryVisualizer {

    private _spriteId: string;

    private _atlas: SpriteTextureAtlas;

    protected beforeShow (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        if (this._spriteId) {
            this._atlas.setSpriteVisible(this._spriteId, true);
        }
    }

    /**
     * 获取贴图图片源
     * - 子类需重写此方法
     * @param entity 
     * @returns 
     */
    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        return null;
    }

    /**
     * 获取最终显示的内容的尺寸
     * - 子类需重写此方法
     * @param entity 
     * @returns 
     */
    protected getSpecSize (entity: Entity): Size {
        return null;
    }

    /**
     * 重写计算显示内容的UV范围
     * @param entity 
     * @param uvRange 
     * @param tileTextureSize 
     * @param tileSize 
     * @returns 
     */
    protected recalcUvRange (entity: Entity, uvRange: RectangleRange, tileTextureSize: number, tileSize: number): RectangleRange {
        return uvRange;
    }

    /**
     * 获取Sprite最终显示的位置
     * - 子类需重写此方法
     * @param entity 
     * @returns 
     */
    protected getSpritePosition (entity: Entity): Cartographic {
        return null;
    }

    /**
     * 获取sprite的旋转
     * @param entity 
     * @returns 
     */
    protected getSpriteRotation (entity: Entity) {
        return 0;
    }

    /**
     * 获取sprite的锚点
     * @param entity 
     * @returns 
     */
    protected getSpriteAnchor (entity: Entity): ICartesian2Like {
        return { x: 0.5, y: 0.5 };
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const texImageSource = this.getTexImageSource(entity);
        const atlas = spriteTextureAtlasManager.getAltas(texImageSource.width);
        const spriteId = atlas.showSprite({
            position: this.getSpritePosition(entity),
            tilingScheme: tilingScheme,
            renderer: renderer,
            spriteImage: texImageSource,
            rotation: this.getSpriteRotation(entity),
            anchor: this.getSpriteAnchor(entity),
            specSize: this.getSpecSize(entity),
            //根据文本宽高重新计算一下uvRange
            recalcUvRange: (uvRange: RectangleRange, tileTextureSize: number, tileSize: number) => {
                return this.recalcUvRange(entity, uvRange, tileTextureSize, tileSize);
            },
        });
        this._spriteId = spriteId;
        this._atlas = atlas;
        const mesh = atlas.getSpriteById(this._spriteId).mesh;
        //@ts-ignore
        if (!mesh.center) {
            // @ts-ignore
            mesh.center = new Vector2(0.5, 0.5);
        }
        return mesh;
    }

    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        if (this._atlas) this._atlas.onRendererSize(renderer);
    }

    public hide (entity: Entity, root: Object3D<Event>): void {
        if (this._spriteId) {
            this._atlas.setSpriteVisible(this._spriteId, false);
        }
    }

    protected shouldRemoveObjectOnRemoveGeometry (): boolean {
        return false;
    }

    public remove (entity: Entity, root: Object3D<Event>): void {
        if (this._spriteId) {
            super.remove(entity, root);
            const sprite = this._atlas.getSpriteById(this._spriteId);
            this._atlas.removeSprite(this._spriteId);
            //如果已经是空的了 那么需要将Object从场景中移除
            if (sprite.tiledTexture.isEmpty) {
                root.remove(sprite.mesh);
            }
            this._spriteId = null;
            this._atlas = null;
        }
    }

}