import { Vector2 } from "three";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
import { GeometryRerenderProperty, GeometryUpdateProperty } from "../../../decorator/decorator";
import { Log } from "../../../log/log";
import { Cartographic } from "../../cartographic";
import { BillboardGeometryVisualizer } from "../visualizer/billboard_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

type BillboardImageSource = string | CanvasImageSource;

export type BillboardGeometryOptions = {
    //位置
    position: Cartographic;
    //图片源
    image: BillboardImageSource;
    //宽度 默认使用图片资源的宽度
    width?: number;
    //高度 默认使用图片的高度
    height?: number;
    //图片的中心点/锚点 左上角起算 defualt {x:0.5,y:0.5}
    center?: ICartesian2Like;
    //图片的旋转角度 弧度单位 default 0
    rotation?: number;
    //缩放比例 default 1
    scale?: number;
}

export class BillboardGeometry extends BaseGeometry {

    private _ready: boolean;

    /**
     * 图片资源需要异步加载 此属性可以用来判断图片资源是否已经加载完成
     */
    public get ready () {
        return this._ready;
    }

    private _position: Cartographic;

    public get position () {
        return this._position;
    }

    @GeometryUpdateProperty()
    private set position (val: Cartographic) {
        this._position = val;
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

    private _rotation: number;

    public get rotation () {
        return this._rotation;
    }

    @GeometryUpdateProperty()
    public set rotation (val: number) {
        this._rotation = val;
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
        super({ type: GeometryType.BILLBOARD });
        this._ready = false;
        this._position = options.position;
        if (Utils.defined(options.width)) {
            this._width = options.width;
        }
        if (Utils.defined(options.height)) {
            this._height = options.height;
        }
        this._center = Utils.defaultValue(options.center, new Vector2(0.5, 0.5));
        this._rotation = Utils.defaultValue(options.rotation, 0);
        this._scale = Utils.defaultValue(options.scale, 1);
        this.clampCenter();
        this.visualizer = new BillboardGeometryVisualizer();
        this.image = options.image;
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
                throttle: false
            }).then(imageEle => {
                this._texImageSource = imageEle;
                //设置宽高
                if (!Utils.defined(this._width)) {
                    this._width = imageEle.width;
                }
                if (!Utils.defined(this._height)) {
                    this._height = imageEle.height;
                }
                this._ready = true;
                this.render();
            }).catch(err => {
                Log.error(BillboardGeometry, `load image failed: ${this._image}`);
            });
        } else {
            this._texImageSource = this._image as CanvasImageSource;
            this._ready = true;
            this.render();
        }
    }

    //触发渲染更新
    public render (): void {
        if (this._ready) {
            super.render();
        }
    }

    public clone () {
        return new BillboardGeometry({
            position: this.position.clone(),
            image: this.image,
            width: this.width,
            height: this.height
        });
    }

}