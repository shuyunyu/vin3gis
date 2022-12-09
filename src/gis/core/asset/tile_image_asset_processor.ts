import { imageDecoder } from "../../../core/worker/image_decoder";
import { ImageRequestResult } from "../../@types/core/gis";

/**
 * 瓦片图片资源处理对象
 */
export class TileImageAssetProcessor {

    private _abort: boolean;

    private _image: ImageRequestResult;

    public constructor (image: ImageRequestResult) {
        this._image = image;
        this._abort = false;
    }

    public process () {
        return new Promise<ImageBitmap>((resolve, reject) => {
            if (this._image instanceof ImageBitmap) {
                if (!this._abort) resolve(this._image);
            } else if (this._image instanceof Blob) {
                imageDecoder.imageBlobToImageBitMap(this._image, { imageOrientation: 'flipY' }).then(imageBitMap => {
                    if (!this._abort) resolve(imageBitMap);
                });
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
        this.abort();
        this._image = null;
    }

}