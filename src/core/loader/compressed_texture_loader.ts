import { CompressedTexture, LinearFilter, LoadingManager } from "three";
import { XHRResponseType } from "../xhr/xhr_request";
import { BaseLoader } from "./base_loader";
import { FileLoader } from "./file_loader";

/**
 * Abstract Base class to block based textures loader (dds, pvr, ...)
 *
 * Sub classes have to implement the parse() method which will be used in load().
 */

type OnLoad = (texture: CompressedTexture) => void;
type OnProgress = (total: number, loaded: number) => void;
type OnError = (err: any) => void;


export class CompressedTextureLoader extends BaseLoader {

    public constructor (manager?: LoadingManager) {

        super(manager);

    }

    public load (url: string, onLoad?: OnLoad, onProgress?: OnProgress, onError?: OnError) {

        const scope = this;

        const images = [];

        //@ts-ignore
        const texture = new CompressedTexture();

        const loader = new FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setResponseType(XHRResponseType.ARRAYBUFFER);
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(scope.withCredentials);
        loader.setLoadInWorker(this._loadInWorker);

        let loaded = 0;

        function loadTexture (i) {

            loader.load(url[i], function (buffer) {

                const texDatas = scope.parse(buffer, true);

                images[i] = {
                    width: texDatas.width,
                    height: texDatas.height,
                    format: texDatas.format,
                    mipmaps: texDatas.mipmaps
                };

                loaded += 1;

                if (loaded === 6) {

                    if (texDatas.mipmapCount === 1) texture.minFilter = LinearFilter;
                    //@ts-ignore
                    texture.image = images;
                    texture.format = texDatas.format;
                    texture.needsUpdate = true;

                    if (onLoad) onLoad(texture);

                }

            }, onProgress, onError);

        }

        if (Array.isArray(url)) {

            for (let i = 0, il = url.length; i < il; ++i) {

                loadTexture(i);

            }

        } else {

            // compressed cubemap texture stored in a single DDS file

            loader.load(url, function (buffer) {

                const texDatas = scope.parse(buffer, true);

                if (texDatas.isCubemap) {

                    const faces = texDatas.mipmaps.length / texDatas.mipmapCount;

                    for (let f = 0; f < faces; f++) {

                        images[f] = { mipmaps: [] };

                        for (let i = 0; i < texDatas.mipmapCount; i++) {

                            images[f].mipmaps.push(texDatas.mipmaps[f * texDatas.mipmapCount + i]);
                            images[f].format = texDatas.format;
                            images[f].width = texDatas.width;
                            images[f].height = texDatas.height;

                        }

                    }
                    //@ts-ignore
                    texture.image = images;

                } else {

                    texture.image.width = texDatas.width;
                    texture.image.height = texDatas.height;
                    texture.mipmaps = texDatas.mipmaps;

                }

                if (texDatas.mipmapCount === 1) {

                    texture.minFilter = LinearFilter;

                }

                texture.format = texDatas.format;
                texture.needsUpdate = true;

                if (onLoad) onLoad(texture);

            }, onProgress, onError);

        }

        return texture;

    }

    protected parse (buffer: ArrayBuffer, loadMipmaps?: boolean) {
        return null;
    }

}
