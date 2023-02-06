import { Event, Object3D, Vector2 } from "three";
import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/msic/size";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
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

    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        return null;
    }

    protected getSpecSize (entity: Entity): Size {
        return null;
    }

    protected recalcUvRange (entity: Entity, uvRange: RectangleRange, tileTextureSize: number, tileSize: number): RectangleRange {
        return uvRange;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const texImageSource = this.getTexImageSource(entity);
        const atlas = spriteTextureAtlasManager.getAltas(texImageSource.width);
        const spriteId = atlas.showSprite({
            position: entity.label.position,
            tilingScheme: tilingScheme,
            renderer: renderer,
            spriteImage: texImageSource,
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