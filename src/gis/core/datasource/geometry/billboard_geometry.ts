import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { billboardGeometryCanvasProvider } from "../../misc/provider/billboard_geometry_canvas_provider";
import { AtlasBillboardGeometryVisualizer } from "../visualizer/atlas_billboard_geometry_visualizer";
import { BaseBillboardGeometry, BaseBillboardGeometryOptions, BillboardSingleRenderData } from "./base_billboard_geometry";
import { GeometryType } from "./geometry";

export type BillboardGeometryOptions = {
    //位置
    position: Cartographic;
    //图片的旋转角度 弧度单位 default 0
    rotation?: number;
    //锚点 默认 {x:0.5, y:0.5}
    anchor?: ICartesian2Like;
    //缩放比例 default 1
    scale?: number;
} & BaseBillboardGeometryOptions

export class BillboardGeometry extends BaseBillboardGeometry {

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    @GeometryUpdateProperty()
    private set position (val: Cartographic) {
        this._position = val;
    }

    private _rotation: number;

    public get rotation () {
        return this._rotation;
    }

    @GeometryUpdateProperty()
    public set rotation (val: number) {
        this._rotation = val;
    }

    private _anchor: ICartesian2Like;

    public get anchor () {
        return this._anchor;
    }

    @GeometryUpdateProperty()
    public set anchor (val: ICartesian2Like) {
        this._anchor = val;
    }

    private _scale: number;

    public get scale () {
        return this._scale;
    }

    @GeometryUpdateProperty()
    public set scale (val: number) {
        this._scale = Math.max(0, val);
    }

    public constructor (options: BillboardGeometryOptions) {
        super(options, GeometryType.BILLBOARD, new AtlasBillboardGeometryVisualizer());
        this._position = options.position;
        this._rotation = Utils.defaultValue(options.rotation, 0);
        this._anchor = Utils.defaultValue(options.anchor, { x: 0.5, y: 0.5 });
        this._scale = Utils.defaultValue(options.scale, 1);
        this._instanceCount = 1;
    }

    protected onImageLoaded (imageEle: CanvasImageSource) {
        this._texImageSource = billboardGeometryCanvasProvider.createCanvas(imageEle);
    }

    public getRenderData (): BillboardSingleRenderData[] {
        return [{
            position: this.position,
            rotation: this.rotation,
            anchor: this.anchor,
            scale: this.scale,
            width: this.width,
            height: this.height
        }];
    }

    public clone () {
        return new BillboardGeometry({
            image: this.image,
            width: this.width,
            height: this.height,
            position: this.position.clone(),
            rotation: this.rotation,
            scale: this.scale
        });
    }

}