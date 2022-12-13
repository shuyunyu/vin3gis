import { SystemDefines } from "../../../@types/core/system/system";
import { AssetLoader } from "../../../core/asset/asset_loader";
import { Utils } from "../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { BaseImageryTileProvider } from "./base_imagery_tile_provider";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";

export class UrlTemplateImageryProvider extends BaseImageryTileProvider {
    //切片请求地址 
    protected _url: string = '';

    //url中 {s}使用的 子域名
    protected _subdomains: string[] = [];

    public get subdomains () {
        return this._subdomains;
    }

    public get url () {
        return this._url;
    }

    constructor (imageryTileProviderOptions?: ImageryTileProviderOptions) {
        super(imageryTileProviderOptions);
        imageryTileProviderOptions = Utils.defaultValue(imageryTileProviderOptions, {});
        this._url = Utils.defaultValue(imageryTileProviderOptions!.url, '');
        this._subdomains = Utils.defaultValue(imageryTileProviderOptions!.subdomain, []);
    }

    /**
     * 创建瓦片图片地址
     */
    public createTileImageryUrl (x: number, y: number, level: number) {
        if (this.tms) {
            const maxY = this.tilingScheme.getNumberOfYTilesAtLevel(level);
            y = maxY - y - 1;
        }
        let url = this.url.replace('{x}', x.toString()).replace('{y}', y.toString()).replace('{z}', level.toString());
        if (this.subdomains.length) {
            let index = Math.floor(Math.random() * this.subdomains.length);
            url = url.replace('{s}', this.subdomains[index]);
        }
        return url;
    }

    //请求图片资源
    public requestTileImageAsset (x: number, y: number, level: number, priority: number, onComplete: (img: ImageRequestResult, state: RequestTaskStatus) => void): IScheduleRequestTask | undefined {
        //满足缩放等级范围才去请求瓦片
        if (this.validateTileLevelIsInRange(level)) {
            let url = this.createTileImageryUrl(x, y, level);
            return AssetLoader.requestImageBlobAsync({
                url: url,
                priority: priority,
                requestInWorker: true,
                taskType: SystemDefines.RequestTaskeType.RASTER_TILE,
                throttle: true,
                throttleServer: true
            }, (res) => {
                onComplete(res.image, res.result.status);
            })
        } else {
            //返回一个空的asset
            onComplete(null, RequestTaskStatus.ABORT);
            return undefined;
        }
    }

}