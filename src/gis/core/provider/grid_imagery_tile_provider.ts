import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { tileGridFactor } from "../worker/tile_grid_factory";
import { BaseImageryTileProvider } from "./base_imagery_tile_provider";

/**
 * 瓦片网格图片提供者
 */
export class GridImageryTileProvider extends BaseImageryTileProvider {


    public constructor () {
        super();
    }

    public requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined {
        tileGridFactor.createGrid({
            x: x,
            y: y,
            level: level,
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            border: {
                width: 3,
                color: "#FFD700",
            },
            font: "30px serif",
            fontColor: "#FFD700"
        }).then((image) => {
            onComplete(image, RequestTaskStatus.SUCCESS);
        }).catch(err => {
            onComplete(null, RequestTaskStatus.ERROR);
        });
        return undefined;
    }

}