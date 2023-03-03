import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/misc/size";
import { ICartesian2Like } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BillboardGeometry } from "../geometry/billboard_geometry";
import { SpriteAtlasGeometryVisualizer } from "./sprite_atlas_geometry_visualizer";

export class AtlasBillboardGeometryVisualizer extends SpriteAtlasGeometryVisualizer {

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.billboard;
    }

    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        //@ts-ignore
        return entity.billboard.texImageSource;
    }

    protected getSpecSize (entity: Entity): Size {
        const billboard = entity.billboard;
        return new Size(billboard.imageSourceWidth, billboard.imageSourceHeight);
    }

    protected getSpriteRotation (entity: Entity): number {
        return (entity.billboard as BillboardGeometry).rotation;
    }

    protected getSpriteAnchor (entity: Entity): ICartesian2Like {
        return (entity.billboard as BillboardGeometry).anchor;
    }

    protected getWidthAndHeightScale (entity: Entity): { widthScale: number; heihgtScale: number; } {
        const billboard = entity.billboard;
        const wScale = billboard.width / billboard.imageSourceWidth;
        const hScale = billboard.height / billboard.imageSourceHeight;
        return { widthScale: wScale, heihgtScale: hScale };
    }

    protected recalcUvRange (entity: Entity, uvRange: RectangleRange, tileTextureSize: number, tileSize: number): RectangleRange {
        const billboard = entity.billboard as BillboardGeometry;
        const d = tileSize / tileTextureSize;
        const imageTextWidthScale = billboard.imageSourceWidth / Number(billboard.texImageSource.width);
        const imageTextHeightScale = billboard.imageSourceHeight / Number(billboard.texImageSource.height);
        const wD = imageTextWidthScale * d;
        const wH = imageTextHeightScale * d;
        uvRange.xmax = uvRange.xmin + wD;
        uvRange.ymin = uvRange.ymax - wH;
        return uvRange;
    }

    protected getSpritePosition (entity: Entity): Cartographic {
        return (entity.billboard as BillboardGeometry).position;
    }

}