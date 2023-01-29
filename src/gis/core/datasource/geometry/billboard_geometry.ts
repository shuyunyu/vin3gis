import { Vector2 } from "three";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
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

    private set position (val: Cartographic) {
        this._position = val;
        this.update();
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

    public set width (val: number) {
        this._width = val;
        this.update();
    }

    private _height: number;

    public get height () {
        return this._height;
    }

    public set height (val: number) {
        this._height = val;
        this.update();
    }

    private _center: ICartesian2Like;

    public get center () {
        return this._center;
    }

    public set center (val: ICartesian2Like) {
        this._center = val;
        this.clampCenter();
        this.update();
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
                this.update();
            }).catch(err => {
                Log.error(BillboardGeometry, `load image failed: ${this._image}`);
            });
        } else {
            this._texImageSource = this._image as CanvasImageSource;
            this._ready = true;
            this.update();
        }
    }

    //触发渲染更新
    public update (): void {
        if (this._ready) {
            super.update();
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