import { Color } from "three";
import { CanvasTextBuilder, CanvasTextBuildResult } from "../../../../core/msic/canvas_text_builder";
import { GeometryRerenderProperty, GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { InternalConfig } from "../../internal/internal_config";
import { LabelGeometryVisualizer } from "../visualizer/label_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export enum LabelTextAlign {

}

export type LabelGeometryOptions = {
    position: Cartographic;
    text: string;//标注的文本
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string | Color;
    align?: LabelTextAlign;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    backgroundColor?: string | Color;
    lineHeight?: number;
}

export class LabelGeometry extends BaseGeometry {

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    @GeometryUpdateProperty()
    public set position (val: Cartographic) {
        this._position = val;
    }

    private _text: string;

    public get text () {
        return this._text;
    }

    @GeometryRerenderProperty()
    public set text (val: string) {
        this._text = val;
        this.drawText();
    }

    private _canvasTextBuildResult: CanvasTextBuildResult;

    /**
     * 贴图图片资源
     */
    public get texImageSource () {
        return this._canvasTextBuildResult.canvas;
    }

    /**
     * 文本宽度
     */
    public get textWidth () {
        return this._canvasTextBuildResult.textWidth;
    }

    /**
     * 文本高度
     */
    public get textHeight () {
        return this._canvasTextBuildResult.textHeight;
    }

    public constructor (options: LabelGeometryOptions) {
        super({ type: GeometryType.LABEL });
        this._position = options.position;
        this._text = options.text;
        this.visualizer = new LabelGeometryVisualizer();
        this.drawText();
    }

    private drawText () {
        this._canvasTextBuildResult = CanvasTextBuilder.buildTextCanvas(this._text, {
            outputSquare: true,
            specSquareSize: InternalConfig.TEXT_TILED_TEXTURE_ATLAS_TILE_SIZE
        });
    }

}