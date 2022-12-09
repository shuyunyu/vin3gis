import { TaskProcessor } from "./task_processor";
import ImageDecoderWorkerScriptStr from "./image_decoder_worker.worker";

enum TaskType {
    BUFFER = "base64BufferToImageBitMap",
    BLOB = "base64BlobToImageBitMap"
}

type InputParams = {
    type: TaskType;
    base64Buffers?: Uint8Array[];
    mimeTypes?: string[];
    blobs?: Blob[];
    options?: ImageBitmapOptions[];
}

type OutpuParams = ImageBitmap[];

/**
 * 图片解码器
 */
class ImageDecoder {

    private _inited: boolean;

    private _taskProcessor: TaskProcessor<InputParams, OutpuParams>;

    public constructor () {
        this._inited = false;
    }

    private init () {
        if (this._inited) return;
        this._inited = true;
        this._taskProcessor = new TaskProcessor(ImageDecoderWorkerScriptStr);
    }

    private getUint8Array (bytes: number[] | Uint8Array) {
        if (bytes instanceof Uint8Array) return bytes;
        return new Uint8Array(bytes);
    }

    /**
     * 图片buffer转ImageBitMap
     * @param bytes 
     * @param mimeType 
     * @returns 
     */
    public imageBufferToImageBitMap (bytes: number[] | Uint8Array, mimeType: string, option?: ImageBitmapOptions) {
        const buffer = this.getUint8Array(bytes);
        this.init();
        return new Promise<ImageBitmap>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                type: TaskType.BUFFER,
                base64Buffers: [buffer],
                mimeTypes: [mimeType],
                options: [option]
            }, [buffer.buffer]).then(res => {
                resolve(res[0]);
            }).catch(reject);
        });
    }

    /**
     * 图片buffer转ImageBitMap
     * @param blob 
     * @returns 
     */
    public imageBlobToImageBitMap (blob: Blob, option?: ImageBitmapOptions) {
        this.init();
        return new Promise<ImageBitmap>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                type: TaskType.BLOB,
                blobs: [blob],
                options: [option]
            }, null).then(res => {
                resolve(res[0]);
            }).catch(reject);
        });
    }

    /**
     * 批量图片转ImageBitMap
     * @param blobs 
     * @param option 
     */
    public imageBlobToImageBitMapMulti (blobs: Blob[], options?: ImageBitmapOptions[]) {
        this.init();
        return new Promise<ImageBitmap[]>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                type: TaskType.BLOB,
                blobs: blobs,
                options: options
            }, null).then(res => {
                resolve(res)
            }).catch(reject);
        });
    }

}

export const imageDecoder = new ImageDecoder();