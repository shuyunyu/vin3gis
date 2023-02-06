import { Object3D, Event, Vector2 } from "three";
import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/msic/size";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";
import { TiledTextureSpriteVisualizer } from "./tiled_texture_sprite_visualizer";

const tiledTextureSpriteVisualizer = new TiledTextureSpriteVisualizer(1024, 128);

export class LabelGeometryVisualizer extends BaseGeometryVisualizer {

    private _spriteId: string;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.label;
    }

    protected beforeShow (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        if (this._spriteId) {
            tiledTextureSpriteVisualizer.setSpriteVisible(this._spriteId, true);
        }
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): Object3D<Event> {
        const label = entity.label;
        const spriteId = tiledTextureSpriteVisualizer.showSprite({
            position: entity.label.position,
            tilingScheme: tilingScheme,
            renderer: renderer,
            spriteImage: label.texImageSource,
            specSize: new Size(label.textWidth, label.textHeight),
            //根据文本宽高重新计算一下uvRange
            recaclUvRange (uvRange: RectangleRange, tileTextureSize: number, tileSize: number) {
                const d = tileSize / tileTextureSize;
                const imageTextWidthScale = label.textWidth / label.texImageSource.width;
                const imageTextHeightScale = label.textHeight / label.texImageSource.width;
                const wD = imageTextWidthScale * d;
                const wH = imageTextHeightScale * d;
                uvRange.xmax = uvRange.xmin + wD;
                uvRange.ymin = uvRange.ymax - wH;
                return uvRange;
            },
        });
        this._spriteId = spriteId;
        const mesh = tiledTextureSpriteVisualizer.getSpriteById(this._spriteId).mesh;
        //@ts-ignore
        if (!mesh.center) {
            //@ts-ignore
            mesh.center = new Vector2(0.5, 0.5);
        }
        return mesh;
    }

    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer): void {
        tiledTextureSpriteVisualizer.onRendererSize(renderer);
    }

    public hide (entity: Entity, root: Object3D<Event>): void {
        if (this._spriteId) {
            tiledTextureSpriteVisualizer.setSpriteVisible(this._spriteId, false);
        }
    }

    protected shouldRemoveObjectOnRemoveGeometry (): boolean {
        return false;
    }

    public remove (entity: Entity, root: Object3D<Event>): void {
        if (this._spriteId) {
            super.remove(entity, root);
            const sprite = tiledTextureSpriteVisualizer.getSpriteById(this._spriteId);
            tiledTextureSpriteVisualizer.removeSprite(this._spriteId);
            //如果已经是空的了 那么需要将Object从场景中移除
            if (sprite.tiledTexture.isEmpty) {
                root.remove(sprite.mesh);
            }
        }
    }

}