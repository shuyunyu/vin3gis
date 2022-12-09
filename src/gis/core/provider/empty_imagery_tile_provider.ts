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
        onComplete(null, RequestTaskStatus.ABORT);
        return undefined;
    }

}