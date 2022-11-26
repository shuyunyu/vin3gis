import { XHRResponse } from "../xhr_request";

export class RequestUtil {

    /**
     * 从响应中创建图片
     * @param response 
     */
    public static createImageFromResponse (response: XHRResponse, onImageLoad: (image: HTMLImageElement) => void) {
        const imageData = response.data as ArrayBuffer;
        const uint8Array = new Uint8Array(imageData);
        const size = uint8Array.length;
        const binaryStrArr: string[] = new Array(size);
        for (let i = 0; i < size; i++) {
            const val = uint8Array[i];
            binaryStrArr[i] = String.fromCharCode(val);
        }
        const data = binaryStrArr.join("");
        const base64 = window.btoa(data);
        const imageType = response.headers["content-type"];
        const imageBase64 = `data:${imageType};base64,` + base64;
        const image = new Image();
        image.setAttribute("crossOrigin", "Anonymous");
        image.onload = () => {
            image.onload = null;
            onImageLoad(image);
        }
        image.src = imageBase64;
        return image;
    }

}