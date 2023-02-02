import { Vector2 } from "three";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { math } from "../../../../core/math/math";
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
    //图片的中心点/锚点 左上角起算 defualt {x:0.5,y:0.5}
    center?: ICartesian2Like;
}

//渲染单个billboard需要用到的数据
export type BillboardSingleRenderData = {
    position: Cartographic;
    rotation: number;
    scale: number;
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

    private _texImageSource: CanvasImageSource;

    /**
     * 用来构建贴图的图片资源
     */
    public get texImageSource () {
        return this._texImageSource;
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

    private _center: ICartesian2Like;

    public get center () {
        return this._center;
    }

    @GeometryRerenderProperty()
    public set center (val: ICartesian2Like) {
        this._center = val;
        this.clampCenter();
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
        this._center = Utils.defaultValue(options.center, new Vector2(0.5, 0.5));
        this.clampCenter();
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

    private clampCenter () {
        this._center.x = math.clamp(this._center.x, 0, 1);
        this._center.y = math.clamp(this._center.y, 0, 1);
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
                this.updateWidthAndHeightProp(imageEle);
                this._ready = true;
                this.render();
            }).catch(err => {
                Log.error(BaseBillboardGeometry, `load image failed: ${this._image}`);
            });
        } else {
            this._texImageSource = this._image as CanvasImageSource;
            this.updateWidthAndHeightProp(this._texImageSource);
            this._ready = true;
            this.render();
        }
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