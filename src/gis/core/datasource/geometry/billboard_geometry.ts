import { AssetLoader } from "../../../../core/asset/asset_loader";
import { Utils } from "../../../../core/utils/utils";
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
        this.visualizer = new BillboardGeometryVisualizer();
        this.image = options.image;
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