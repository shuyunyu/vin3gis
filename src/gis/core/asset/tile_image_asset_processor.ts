/**
 * 瓦片图片资源处理对象
 */
export class TileImageAssetProcessor {

    private _abort: boolean;

    private _image: HTMLImageElement | ImageBitmap;

    public constructor (image: HTMLImageElement | ImageBitmap) {
        this._image = image;
        this._abort = false;
    }

    public process () {
        return new Promise<ImageBitmap>((resolve, reject) => {
            if (this._image instanceof ImageBitmap || true) {
                //@ts-ignore
                resolve(this._image);
            } else {
                //TODO do it in worker.
                createImageBitmap(this._image, { imageOrientation: 'flipY' }).then(imageBitmap => {
                    if (!this._abort) resolve(imageBitmap);
                }).catch(reject);
            }

        });
    }

    public abort () {
        this._abort = true;
    }

    public dispose () {
        this._image = null;
    }

}