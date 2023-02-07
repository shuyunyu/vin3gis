import { RectangleRange } from "../../../../@types/global/global";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
import { GeometryRerenderProperty } from "../../../decorator/decorator";
import { Log } from "../../../log/log";
import { Cartographic } from "../../cartographic";
import { BaseGeometryVisualizer } from "../visualizer/base_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

type BillboardImageSource = string | CanvasImageSource;

export type BaseBillboardGeometryOptions = {
    //图片源
    image: BillboardImageSource;
    //宽度 默认使用图片资源的宽度
    width?: number;
    //高度 默认使用图片的高度
    height?: number;
}

//渲染单个billboard需要用到的数据
export type BillboardSingleRenderData = {
    position: Cartographic;
    rotation: number;
    scale: number;
    anchor?: ICartesian2Like;
    width?: number;//渲染图片的宽度
    height?: number;//渲染图片的高度
    uvRange?: RectangleRange;//uv坐标范围
}

export class BaseBillboardGeometry extends BaseGeometry {

    protected _ready: boolean;

    /**
     * 图片资源需要异步加载 此属性可以用来判断图片资源是否已经加载完成
     */
    public get ready () {
        return this._ready;
    }

    private _image: BillboardImageSource;

    public get image () {
        return this._image;
    }

    public set image (val: BillboardImageSource) {
        this._image = val;
        this.updateImage();
    }

    protected _texImageSource: CanvasImageSource;

    /**
     * 用来构建贴图的图片资源
     */
    public get texImageSource () {
        return this._texImageSource;
    }

    private _imageSourceWidth: number;

    //图像原本宽度
    public get imageSourceWidth () {
        return this._imageSourceWidth;
    }

    private _imageSourceHeight: number;

    //图像原本高度
    public get imageSourceHeight () {
        return this._imageSourceHeight;
    }

    private _width: number;

    public get width () {
        return this._width;
    }

    @GeometryRerenderProperty()
    public set width (val: number) {
        this._width = val;
    }

    private _height: number;

    public get height () {
        return this._height;
    }

    @GeometryRerenderProperty()
    public set height (val: number) {
        this._height = val;
    }

    protected _instanceCount: number;

    //实例个数 子类需要设置此值
    public get instanceCount () {
        return this._instanceCount;
    }

    public constructor (options: BaseBillboardGeometryOptions, type: GeometryType, visualizer: BaseGeometryVisualizer) {
        super({ type: type });
        this._ready = false;
        if (Utils.defined(options.width)) {
            this._width = options.width;
        }
        if (Utils.defined(options.height)) {
            this._height = options.height;
        }
        this.visualizer = visualizer;
        this.image = options.image;
    }

    /**
     * 获取用于渲染billboard的数据
     * - 子类需要重写此方法
     * @returns 
     */
    public getRenderData (): BillboardSingleRenderData[] {
        return [];
    }

    /**
     * 更新图片资源
     */
    private updateImage () {
        this._ready = false;
        if (Utils.isString(this._image)) {
            AssetLoader.loadImage({
                url: this._image as string,
                throttle: false,
                throttleServer: false
            }).then(imageEle => {
                this._texImageSource = imageEle;
                this._imageSourceWidth = imageEle.width;
                this._imageSourceHeight = imageEle.height;
                this.onImageLoaded(this._texImageSource);
                this.updateWidthAndHeightProp(imageEle);
                this._ready = true;
                this.render();
            }).catch(err => {
                Log.error(BaseBillboardGeometry, `load image failed: ${this._image}`);
            });
        } else {
            this._texImageSource = this._image as CanvasImageSource;
            this._imageSourceWidth = Number(this._texImageSource.width);
            this._imageSourceHeight = Number(this._texImageSource.height);
            this.onImageLoaded(this._texImageSource);
            this.updateWidthAndHeightProp(this._texImageSource);
            this._ready = true;
            this.render();
        }
    }

    protected onImageLoaded (imageEle: CanvasImageSource) {

    }

    /**
     * 更新属性中的width和height数据
     * @param imageEle 
     */
    private updateWidthAndHeightProp (imageEle: CanvasImageSource) {
        //设置宽高
        if (!Utils.defined(this._width)) {
            this._width = Number(imageEle.width);
        }
        if (!Utils.defined(this._height)) {
            this._height = Number(imageEle.height);
        }
    }

    //触发渲染更新
    public render (): void {
        if (this._ready) {
            super.render();
        }
    }

}