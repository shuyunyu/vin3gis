import { MathUtils } from "three";
import { RectangleRange } from "../../../../@types/global/global";
import { Size } from "../../../../core/msic/size";
import { Cartographic } from "../../cartographic";
import { pointGeometryCanvasProvider } from "../../misc/provider/point_geometry_canvas_provider";
import { Entity } from "../entity";
import { BaseGeometry } from "../geometry/base_geometry";
import { BasePointGeometry } from "../geometry/base_point_geometry";
import { SpriteAtlasGeometryVisualizer } from "./sprite_atlas_geometry_visualizer";

export class PointGeometryVisualizer extends SpriteAtlasGeometryVisualizer {

    private _imageSize: number;

    protected getEntityGeometry (entity: Entity): BaseGeometry {
        return entity.point;
    }

    protected getTexImageSource (entity: Entity): HTMLCanvasElement {
        const basePointGeometry = this.getEntityGeometry(entity) as BasePointGeometry;
        const fullSize = basePointGeometry.outline ? basePointGeometry.size + basePointGeometry.outlineSize : basePointGeometry.size;
        this._imageSize = MathUtils.ceilPowerOfTwo(fullSize);
        const canvas = pointGeometryCanvasProvider.createCanvas({
            canvasSize: this._imageSize,
            size: basePointGeometry.size,
            color: basePointGeometry.color,
            outline: basePointGeometry.outline,
            outlineSize: basePointGeometry.outlineSize,
            outlineColor: basePointGeometry.outlineColor
        });
        return canvas;
    }

    protected getSpecSize (entity: Entity): Size {
        return new Size(this._imageSize, this._imageSize);
    }

    protected recalcUvRange (entity: Entity, uvRange: RectangleRange, tileTextureSize: number, tileSize: number): RectangleRange {
        return uvRange;
    }

    protected getSpritePosition (entity: Entity): Cartographic {
        return entity.point.position;
    }

}