import { TaskProcessor } from "../../../core/worker/task_processor";
import TileGridWorkerScriptStr from "./tile_grid_worker.js";

type InputParams = {
    x: number;
    y: number;
    level: number;
    tileWidth: number;
    tileHeight: number;
    border?: {
        width: number;
        color: string;
    };
    font?: string;
    fontColor?: string;
}

/**
 * 瓦片网格工厂
 */
class TileGridFactory {

    private _init: boolean = false;

    private _taskProcessor: TaskProcessor<InputParams, ImageBitmap>;

    public init () {
        if (this._init) return;
        this._init = true;
        this._taskProcessor = new TaskProcessor(TileGridWorkerScriptStr);
    }

    /**
     * 创建网格图片
     * @param input 
     * @returns 
     */
    public createGrid (input: InputParams) {
        this.init();
        return new Promise<ImageBitmap>((resolve, reject) => {
            const canvas = new OffscreenCanvas(input.tileWidth, input.tileHeight);
            //@ts-ignore
            input.canvas = canvas;
            this._taskProcessor.scheduleTask(input, [canvas]).then(image => {
                resolve(image);
            }).catch(reject);
        });
    }

}

export const tileGridFactor = new TileGridFactory();