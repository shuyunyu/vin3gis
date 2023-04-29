import { Color } from "three";
import { IEarth3DTileContent } from "./earth_3dtile_content";

export class Earth3DTileFeature {

    private _content: IEarth3DTileContent;

    public get content () {
        return this._content;
    }

    public get tileset () {
        return this._content.tileset;
    }

    public get primitive () {
        return this._content.tileset;
    }

    private _batchId: number;

    public get featureId () {
        return this._batchId;
    }

    private _show: boolean = true;

    public get show () {
        return this._show;
    }

    //TODO 在shader中控制显示隐藏
    public set show (val: boolean) {
        this._show = val;
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    //TODO 在shader中控制颜色
    public set color (val: Color) {
        this._color = val;
    }

    public constructor (content: IEarth3DTileContent, batchId: number) {
        this._content = content;
        this._batchId = batchId;
    }

    public hasProperty (name: string) {
        return this._content.batchTable.hasProperty(this._batchId, name);
    }

    public getPropertyIds (results?: string[]) {
        return this._content.batchTable.getPropertyIds(this._batchId, results);
    }

    public getProperty (name: string) {
        return this._content.batchTable.getProperty(this._batchId, name);
    }

    public isExactClass (className: string) {
        return this._content.batchTable.isExactClass(this._batchId, className);
    }

    public isClass (className: string) {
        return this._content.batchTable.isClass(this._batchId, className);
    }

    public getExactClassName () {
        return this._content.batchTable.getExactClassName(this._batchId);
    }

}