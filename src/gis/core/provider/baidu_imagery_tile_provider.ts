import { Utils } from "../../../core/utils/utils";
import { BD09MercatorTilingScheme } from "../tilingscheme/bd09_mercator_tiling_scheme";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

export class BaiduImageryTileProvider extends UrlTemplateImageryProvider {

    private _style: string;

    private _isWgs84 = true;

    public constructor (options?: ImageryTileProviderOptions) {
        options = Object.assign({}, options, { tilingScheme: new BD09MercatorTilingScheme() });
        super(options);
        this._style = Utils.defaultValue(options.style, 'normal');
        this._url = this.getUrlTemplate(this._style);
        this._subdomains = ['0', '1', '2'];
    }

    public createTileImageryUrl (x: number, y: number, level: number): string {
        if (!this.ready) return;
        let xTiles = this.tilingScheme.getNumberOfXTilesAtLevel(level)
        let yTiles = this.tilingScheme.getNumberOfYTilesAtLevel(level)
        let url = this._url
            .replace('{z}', String(level))
            .replace('{s}', String(this.subdomains[Math.floor(Math.random() * this.subdomains.length)]))
        if (this._isWgs84) {
            url = url.replace('{x}', String(x)).replace('{y}', String(-y))
        } else {
            url = url
                .replace('{x}', String(x - xTiles / 2))
                .replace('{y}', String(yTiles / 2 - y - 1))
        }
        return url;
    }

    private getUrlTemplate (style?: string): string {
        let baiduBaseTileUrl = "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20180321&scale=1";
        let resUrl = "";
        switch (style) {
            case "normal":
                resUrl = baiduBaseTileUrl + "&customid=normal";
                break;
            case "dark":
                resUrl = baiduBaseTileUrl + "&customid=dark";
                break;
            case "grayscale":
                resUrl = baiduBaseTileUrl + "&customid=grayscale";
                break;
            case "midnight":
                resUrl = baiduBaseTileUrl + "&customid=midnight";
                break;
            case "light":
                resUrl = baiduBaseTileUrl + "&customid=light";
                break;
            case "redalert":
                resUrl = baiduBaseTileUrl + "&customid=redalert";
                break;
            case "googlelite":
                resUrl = baiduBaseTileUrl + "&customid=googlelite";
                break;
            case "grassgreen":
                resUrl = baiduBaseTileUrl + "&customid=grassgreen";
                break;
            case "pink":
                resUrl = baiduBaseTileUrl + "&customid=pink";
                break;
            case "darkgreen":
                resUrl = baiduBaseTileUrl + "&customid=darkgreen";
                break;
            case "bluish":
                resUrl = baiduBaseTileUrl + "&customid=bluish";
                break;
            case "hardedge":
                resUrl = baiduBaseTileUrl + "&customid=hardedge";
                break;
            default:
                resUrl = baiduBaseTileUrl + "&customid=normal";
                break;
        }
        return resUrl;
    }



}

