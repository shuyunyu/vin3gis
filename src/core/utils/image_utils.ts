/**
 * image工具类
 */
export class ImageUtils {

    /**
     * image转Base64
     * @param img 
     */
    public static imageToBase64 (img: HTMLImageElement, type?: string, quality?: any) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        return canvas.toDataURL(type, quality);
    }

    /**
     * image转blob
     * @param img 
     * @param type 
     * @param quality 
     * @returns 
     */
    public static imageToBlob (img: HTMLImageElement, type?: string, quality?: any) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, type, quality)
        });
    }

}