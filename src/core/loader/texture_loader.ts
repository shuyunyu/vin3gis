import { Loader, LoadingManager, Texture } from "three";
import { ImageBitmapLoader } from "./imagebitmap_loader";
import { ImageLoader } from "./image_loader";

type OnLoad = (texture: Texture) => void;

type OnProgress = (total: number, loaded: number) => void;

type OnError = (err: any) => void;

export class TextureLoader extends Loader {

    private _imageLoader: ImageLoader | ImageBitmapLoader;

    constructor (manager?: LoadingManager) {

        super();

        this._imageLoader = new ImageBitmapLoader(manager);

    }

    public setImageLoader (imageLoader: ImageLoader | ImageBitmapLoader) {
        this._imageLoader = imageLoader;
    }

    public load (url: string, onLoad?: OnLoad, onProgress?: OnProgress, onError?: OnError) {

        const texture = new Texture();

        this._imageLoader.setCrossOrigin(this.crossOrigin);
        this._imageLoader.setPath(this.path);

        this._imageLoader.load(url, function (image: HTMLImageElement | ImageBitmap) {

            texture.image = image;
            texture.needsUpdate = true;

            if (onLoad !== undefined) {

                onLoad(texture);

            }

        }, onProgress, onError);

        return texture;

    }

}
