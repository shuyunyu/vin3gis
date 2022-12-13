import { imageDecoder } from "./image_decoder";
import ImageMergerWorkerScriptStr from "./image_merger_worker.js";
import { TaskProcessor } from "./task_processor";

type InputParams = {
    canvas: any;
    blobs?: Blob[];
    imageBitMaps?: ImageBitmap[];
    width: number;
    height: number;
    imageWidth: number;
    imageHeight: number;
    options?: ImageBitmapOptions[];
}

class ImageMerger {

    private _inited: boolean;

    private _taskProcessor: TaskProcessor<InputParams, ImageBitmap[]>;

    public constructor () {
        this._inited = false;
    }

    private init () {
        if (this._inited) return;
        this._inited = true;
        this._taskProcessor = new TaskProcessor(ImageMergerWorkerScriptStr);
    }

    /**
     * 合并图片
     * - 合并后的图片按行-列排列
     * @param images
     * @param colCount 每行多少张图片
     * @param rowCount 每列多少张图片
     * @param imageWidth 单张图片宽度
     * @param imageHeight 单张图片高度
     */
    public merge (images: Blob[] | ImageBitmap[], colCount: number, rowCount: number, imageWidth: number, imageHeight: number, options?: ImageBitmapOptions[]) {
        //优先使用OffscreenCanvas合并图片
        if (global.OffscreenCanvas) {
            this.init();
            const finalWidth = imageWidth * colCount;
            const finalHeight = imageHeight * rowCount;
            const isBlob = images[0] instanceof Blob;
            return new Promise<ImageBitmap>((resolve, reject) => {
                //@ts-ignore
                const canvas = new OffscreenCanvas(finalWidth, finalHeight);
                this._taskProcessor.scheduleTask({
                    canvas: canvas,
                    blobs: isBlob ? images as Blob[] : null,
                    imageBitMaps: isBlob ? null : images as ImageBitmap[],
                    width: finalWidth,
                    height: finalHeight,
                    imageWidth: imageWidth,
                    imageHeight: imageHeight,
                    options: options
                }, [canvas]).then(img => {
                    resolve(img[0]);
                }).catch(reject);
            });
        } else {
            return this.mergeWithCanvas(images, colCount, rowCount, imageWidth, imageHeight, options);
        }
    }

    private mergeWithCanvas (imageDatas: Blob[] | ImageBitmap[], colCount: number, rowCount: number, imageWidth: number, imageHeight: number, options?: ImageBitmapOptions[]) {
        return new Promise<ImageBitmap>((resolve, reject) => {
            const isBlob = imageDatas[0] instanceof Blob;
            if (isBlob) {
                imageDecoder.imageBlobToImageBitMapMulti(imageDatas as Blob[], options).then(images => {
                    this.mergeImages(images, colCount, rowCount, imageWidth, imageHeight, options).then(resolve).catch(reject);
                }).catch(reject);
            } else {
                this.mergeImages(imageDatas as ImageBitmap[], colCount, rowCount, imageWidth, imageHeight, options).then(resolve).catch(reject);
            }
        });
    }

    private mergeImages (images: ImageBitmap[], colCount: number, rowCount: number, imageWidth: number, imageHeight: number, options?: ImageBitmapOptions[]) {
        return new Promise<ImageBitmap>((resolve, reject) => {
            const finalWidth = imageWidth * colCount;
            const finalHeight = imageHeight * rowCount;
            const canvas = document.createElement('canvas');
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            const ctx = canvas.getContext('2d');
            let imageIndex = 0;
            for (let i = 0; i < rowCount; i++) {
                for (let j = 0; j < colCount; j++) {
                    const image = images[imageIndex];
                    const dx = j * imageWidth;
                    const dy = i * imageHeight;
                    ctx.drawImage(image, 0, 0, imageWidth, imageHeight, dx, dy, imageWidth, imageHeight);
                    imageIndex++;
                }
            }
            const imageData = ctx.getImageData(0, 0, finalWidth, finalHeight);
            createImageBitmap(imageData).then(resolve).catch(reject);
        })
    }

}

export const imageMerger = new ImageMerger();