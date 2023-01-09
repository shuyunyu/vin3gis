import { Utils } from "../../../core/utils/utils";
import { webMercatorProjection } from "../projection/web_mercator_projection";
import { BD09MercatorTilingScheme } from "../tilingscheme/bd09_mercator_tiling_scheme";
import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

interface BaiduImageryTileProviderOptions extends ImageryTileProviderOptions {
    //是否纠偏 true: 纠偏，使用百度地图投影算法加载切片 这种加载出来的切片仅有世界的四分之一
    //是否纠偏 false: 不纠偏，使用墨卡托投影算法加载切片，只是统计偏移瓦片的xy来加载地图
    //default true
    correction?: boolean;
}

export class BaiduImageryTileProvider extends UrlTemplateImageryProvider {

    public minimumLevel: number = 3;

    public maximumLevel: number = 18;

    private _style: string;

    private _correction: boolean;

    public constructor (options?: BaiduImageryTileProviderOptions) {
        options = options || {};
        options.rectangle = Utils.defaultValue(options.rectangle, webMercatorProjection.rectangle.clone());
        const correction = Utils.defaultValue(options.correction, false);
        if (correction) {
            options.tilingScheme = new BD09MercatorTilingScheme();
        } else {
            options.tilingScheme = new WebMercatorTilingScheme();
        }
        super(options);
        this._correction = correction;
        this._style = Utils.defaultValue(options.style, 'street');
        this._url = Utils.defaultValue(options.url, this.getUrlTemplate(this._style));
        this._subdomains = Utils.defaultValue(options.subdomains, ['0', '1', '2', '3']);
    }

    public createTileImageryUrl (x: number, y: number, level: number) {
        if (this._correction) {
            return super.createTileImageryUrl(x, y, level);
        } else {
            let xTiles = this.tilingScheme.getNumberOfXTilesAtLevel(level)
            let yTiles = this.tilingScheme.getNumberOfYTilesAtLevel(level)
            let url = this._url
                .replace('{z}', String(level))
                .replace('{s}', this.getSubdomain())
                .replace('{x}', String(x - xTiles / 2))
                .replace('{y}', String(yTiles / 2 - y - 1));
            return url;
        }
    }

    private getUrlTemplate (style?: string): string {
        let url = "";
        switch (style.toLocaleLowerCase()) {
            case 'aerial':
                url = "https://maponline{s}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=";
                break;
            case 'street':
                url = "https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=&from=jsapi2_0";
                break;
            default:
                break;
        }
        return url;
    }



}

