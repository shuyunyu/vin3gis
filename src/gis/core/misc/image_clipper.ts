import { SystemDefines } from "../../../@types/core/system/system";
import { AssetLoader } from "../../../core/asset/asset_loader";
import { Utils } from "../../../core/utils/utils";

/**
 * 处理图片裁剪的类
 */
export class ImageClipper implements SystemDefines.Disposable {

    private _image: CanvasImageSource | string;

    private _canvas: HTMLCanvasElement;

    private _ctx: CanvasRenderingContext2D;

    private _imageSource: CanvasImageSource;

    public constructor (image: CanvasImageSource | string) {
        this._image = image;
    }

    /**
     * 初始化裁剪器
     * @returns 
     */
    public init () {
        return new Promise<ImageClipper>((resolve, reject) => {
            if (Utils.isString(this._image)) {
                AssetLoader.loadImage({
                    url: this._image as string,
                    throttle: false,
                    throttleServer: false
                }).then(imageEle => {
                    this.saveImage(imageEle);
                    resolve(this);
                }).catch(reject);
            } else {
                this.saveImage(this._image as CanvasImageSource);
                resolve(this);
            }
        });
    }

    /**
     * 裁剪图片
     * @param sx 
     * @param sy 
     * @param width 
     * @param height 
     */
    public clip (sx: number, sy: number, width: number, height: number, options?: ImageBitmapOptions) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.drawImage(this._imageSource, sx, sy, width, height, 0, 0, width, height);
        const imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        return createImageBitmap(imageData, options);
    }

    private saveImage (image: CanvasImageSource) {
        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');
        this._imageSource = image;
    }

    public dispose () {
        this._image = null;
        this._canvas = null;
        this._ctx = null;
    }

}