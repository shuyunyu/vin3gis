import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/msic/size";
import { ICartesian2Like } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { SpriteAtlasGeometryVisualizer } from "./sprite_atlas_geometry_visualizer";

export class LabelGeometryVisualizer extends SpriteAtlasGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.label;
    }

    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        return entity.label.texImageSource;
    }

    protected getSpecSize (entity: Entity): Size {
        const label = entity.label;
        return new Size(label.textWidth, label.textHeight);
    }

    protected getSpriteRotation (entity: Entity): number {
        return entity.label.rotation;
    }

    protected getSpriteAnchor (entity: Entity): ICartesian2Like {
        return entity.label.anchor;
    }

    protected recalcUvRange (entity: Entity, uvRange: RectangleRange, tileTextureSize: number, tileSize: number): RectangleRange {
        const label = entity.label;
        const d = tileSize / tileTextureSize;
        const imageTextWidthScale = label.textWidth / label.texImageSource.width;
        const imageTextHeightScale = label.textHeight / label.texImageSource.width;
        const wD = imageTextWidthScale * d;
        const wH = imageTextHeightScale * d;
        uvRange.xmax = uvRange.xmin + wD;
        uvRange.ymin = uvRange.ymax - wH;
        return uvRange;
    }

    protected getSpritePosition (entity: Entity): Cartographic {
        return entity.label.position;
    }

}