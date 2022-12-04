import { TileImageAsset } from "../../@types/core/gis";

/**
 * 瓦片图片资源处理对象
 */
export class TileImageAssetProcessor {

    private _abort: boolean;

    private _image: HTMLImageElement | ImageBitmap;

    private _format: string;

    private _canvas: HTMLCanvasElement;

    private _context: CanvasRenderingContext2D;

    public constructor (image: HTMLImageElement | ImageBitmap) {
        this._image = image;
        this._abort = false;
        this._format = "image/png";
        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
    }

    public process () {
        return new Promise<TileImageAsset>((resolve, reject) => {
            const width = this._image.width;
            const height = this._image.height;
            //TODO do it in worker.
            this._context.drawImage(this._image, 0, 0, width, height);
            const imageData = this._context.getImageData(0, 0, width, height);
            if (!this._abort) {
                resolve({
                    pixels: new Uint8Array(imageData.data.buffer),
                    width: imageData.width,
                    height: imageData.height,
                    format: this._format
                });
            }
        });
    }

    public abort () {
        this._abort = true;
    }

    public dispose () {
        this._image = null;
        this._canvas = null;
        this._context = null;
    }

}