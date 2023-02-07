import { Color, Vector2 } from "three";
import { CanvasTextBuilder, CanvasTextBuildResult } from "../../../../core/msic/canvas_text_builder";
import { ColorUtils } from "../../../../core/utils/color_utils";
import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
import { GeometryRerenderProperty, GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { LabelGeometryVisualizer } from "../visualizer/label_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";


export type LabelGeometryOptions = {
    position: Cartographic;
    text: string;//标注的文本
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string | Color;
    shadowColor?: string | Color;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    backgroundColor?: string | Color;
    lineHeight?: number;
    anchor?: ICartesian2Like;
    rotation?: number;
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

    private _fontSize: number;

    public get fontSize () {
        return this._fontSize;
    }

    @GeometryUpdateProperty()
    public set fontSize (val: number) {
        this._fontSize = val;
        this.drawText();
    }

    private _fontFamily: string;

    public get fontFamily () {
        return this._fontFamily;
    }

    @GeometryUpdateProperty()
    public set fontFamily (val: string) {
        this._fontFamily = val;
        this.drawText();
    }

    private _fontColor: string | Color;

    public get fontColor () {
        return this._fontColor;
    }

    @GeometryUpdateProperty()
    public set fontColor (val: string | Color) {
        this._fontColor = val;
        this.drawText();
    }


    private _shadowColor: string | Color;

    public get shadowColor () {
        return this._shadowColor;
    }

    @GeometryUpdateProperty()
    public set shadowColor (val: string | Color) {
        this._shadowColor = val;
        this.drawText();
    }

    private _shadowBlur: number;

    public get shadowBlur () {
        return this._shadowBlur;
    }

    @GeometryUpdateProperty()
    public set shadowBlur (val: number) {
        this._shadowBlur = val;
        this.drawText();
    }

    private _shadowOffsetX: number;

    public get shadowOffsetX () {
        return this._shadowOffsetX;
    }

    @GeometryUpdateProperty()
    public set shadowOffsetX (val: number) {
        this._shadowOffsetX = val;
        this.drawText();
    }

    private _shadowOffsetY: number;

    public get shadowOffsetY () {
        return this._shadowOffsetY;
    }

    @GeometryUpdateProperty()
    public set shadowOffsetY (val: number) {
        this._shadowOffsetY = val;
        this.drawText();
    }

    private _horizontalPadding: number;

    public get horizontalPadding () {
        return this._horizontalPadding;
    }

    @GeometryUpdateProperty()
    public set horizontalPadding (val: number) {
        this._horizontalPadding = val;
        this.drawText();
    }

    private _verticalPadding: number;

    public get verticalPadding () {
        return this._verticalPadding;
    }

    @GeometryUpdateProperty()
    public set verticalPadding (val: number) {
        this._verticalPadding = val;
        this.drawText();
    }

    private _backgroundColor: string | Color;

    public get backgroundColor () {
        return this._backgroundColor;
    }

    @GeometryUpdateProperty()
    public set backgroundColor (val: string | Color) {
        this._backgroundColor = val;
        this.drawText();
    }

    private _lineHeight: number;

    public get lineHeight () {
        return this._lineHeight;
    }

    @GeometryUpdateProperty()
    public set lineHeight (val: number) {
        this._lineHeight = val;
        this.drawText();
    }

    private _anchor: ICartesian2Like;

    public get anchor () {
        return this._anchor;
    }

    @GeometryUpdateProperty()
    public set anchor (val: ICartesian2Like) {
        this._anchor = val;
        this.drawText();
    }

    private _rotation: number;

    public get rotation () {
        return this._rotation;
    }

    @GeometryUpdateProperty()
    public set rotation (val: number) {
        this._rotation = val;
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
        this._fontSize = Utils.defaultValue(options.fontSize, 18);
        this._fontFamily = Utils.defaultValue(options.fontFamily, "Arial");
        this._fontColor = Utils.defaultValue(options.fontColor, "#000000");
        this._shadowColor = Utils.defaultValue(options.shadowColor, 'rgba(0, 0, 0, 0)');
        this._shadowBlur = Utils.defaultValue(options.shadowBlur, 0);
        this._shadowOffsetX = Utils.defaultValue(options.shadowOffsetX, 0);
        this._shadowOffsetY = Utils.defaultValue(options.shadowOffsetY, 0);
        this._horizontalPadding = Utils.defaultValue(options.horizontalPadding, 0);
        this._verticalPadding = Utils.defaultValue(options.verticalPadding, 0);
        this._backgroundColor = Utils.defaultValue(options.backgroundColor, "transparent");
        this._lineHeight = Utils.defaultValue(options.lineHeight, 1.2);
        this._anchor = Utils.defaultValue(options.anchor, new Vector2(0.5, 0.5));
        this._rotation = Utils.defaultValue(options.rotation, 0);
        this.visualizer = new LabelGeometryVisualizer();
        this.drawText();
    }

    private drawText () {
        this._canvasTextBuildResult = CanvasTextBuilder.buildTextCanvas(this._text, {
            outputSquare: true,
            font: `${this.fontSize}px ${this.fontFamily}`,
            fillStyle: this.getColorString(this.fontColor),
            shadowColor: this.getColorString(this.shadowColor),
            shadowBlur: this.shadowBlur,
            shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY,
            lineHeight: this.lineHeight,
            backgroundColor: this.getColorString(this.backgroundColor),
            horizontalPadding: this.horizontalPadding,
            verticalPadding: this.verticalPadding
        });
    }

    private getColorString (color: string | Color): string {
        return Utils.isString(color) ? color as string : ColorUtils.toCSSHexString(color as Color);
    }

}