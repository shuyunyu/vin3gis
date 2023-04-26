import { Utils } from "../../../core/utils/utils";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

/**
 * 腾讯瓦片地图
 */
export class TencentImageryTileProvider extends UrlTemplateImageryProvider {

    private _style: string = '';

    public constructor (options?: ImageryTileProviderOptions) {
        options = options || {};
        options.tms = true;
        super(Object.assign({
            minimumLevel: 3,
            maximumLevel: 18
        }, options));
        // options.tms = true;
        this._subdomains = Utils.defaultValue(options.subdomains, ["0", "1", "2", "3"]);
        this._style = Utils.defaultValue(options.style, "normal");
        this._url = Utils.defaultValue(options.url, this.getUrlTemplate(this._style));
    }

    public getUrlTemplate (style: string) {
        let normalUrl = "http://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&scene=0";
        let darkUrl = "http://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=4&scene=0";
        let resUrl = "";
        switch (style) {
            case "normal":
                resUrl = normalUrl;
                break;
            case "dark":
                resUrl = darkUrl;
                break;
            default:
                resUrl = normalUrl;
                break;
        }
        return resUrl;
    }

}