import { Texture } from "three";

export class TextureUtils {

    public static createTextureByImage (image: HTMLImageElement | ImageBitmap) {
        const texture = new Texture();
        texture.image = image;
        texture.needsUpdate = true;
        return texture;
    }

}