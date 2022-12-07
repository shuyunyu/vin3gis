import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { BaseImageryTileProvider } from "./base_imagery_tile_provider";

/**
 * 一个空的ImageryProvider
 */
export class EmptyImageryTileProvider extends BaseImageryTileProvider {

    public constructor () {
        super();
    }

    public requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined {
        //满足缩放等级范围才去请求瓦片
        if (this.validateTileLevelIsInRange(level)) {
            //创建一个1x1的ImageBitMap
            const pixels = new Uint8ClampedArray([0, 0, 0, 0]);
            const imageData = new ImageData(pixels, 1, 1);
            createImageBitmap(imageData).then(image => {
                onComplete(image, RequestTaskStatus.SUCCESS);
            });
        } else {
            //返回一个空的asset
            onComplete(null, RequestTaskStatus.ABORT);
            return undefined;
        }
    }

}