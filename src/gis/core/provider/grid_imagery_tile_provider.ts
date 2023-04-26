import { Utils } from "../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { tileGridFactor } from "../worker/tile_grid_factory";
import { BaseImageryTileProvider } from "./base_imagery_tile_provider";

type GridImageryTileProviderOptions = {
    borderWidth?: number;
    borderColor?: string;
    font?: string;
    fontColor?: string;
    minimumLevel?: number;
    maximumLevel?: number;
}

/**
 * 瓦片网格图片提供者
 */
export class GridImageryTileProvider extends BaseImageryTileProvider {

    private borderWidth: number;

    private borderColor: string;

    private font: string;

    private fontColor: string;


    public constructor (options?: GridImageryTileProviderOptions) {
        options = options || {};
        super(Object.assign({
            minimumLevel: 0,
            maximumLevel: 21
        }, options));
        this.borderWidth = Utils.defaultValue(options.borderWidth, 2);
        this.borderColor = Utils.defaultValue(options.borderColor, "#FFD700");
        this.font = Utils.defaultValue(options.font, "30px serif");
        this.fontColor = Utils.defaultValue(options.fontColor, "#FFD700");
    }

    public requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined {
        if (this.validateTileLevelIsInRange(level)) {
            tileGridFactor.createGrid({
                x: x,
                y: y,
                level: level,
                tileWidth: this.tileWidth,
                tileHeight: this.tileHeight,
                border: {
                    width: this.borderWidth,
                    color: this.borderColor,
                },
                font: this.font,
                fontColor: this.fontColor,
                options: {
                    imageOrientation: 'flipY'
                }
            }).then((image) => {
                onComplete(image, RequestTaskStatus.SUCCESS);
            }).catch(err => {
                onComplete(null, RequestTaskStatus.ERROR);
            });
        } else {
            onComplete(null, RequestTaskStatus.ABORT);
        }
        return undefined;
    }

}