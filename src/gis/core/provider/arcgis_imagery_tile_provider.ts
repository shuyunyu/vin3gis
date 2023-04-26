import { Utils } from "../../../core/utils/utils";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

const resetUrl = function (options: ImageryTileProviderOptions) {
    options.url = options.url + "/tile/{z}/{y}/{x}" + (Utils.defined(options.token) ? "?token=" + options.token : "");
}

/**
 * ArcGIS瓦片图层
 * - e.g. http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer
 */
export class ArcGISImageryTileProvider extends UrlTemplateImageryProvider {

    private _token: string;

    public get token () {
        return this._token;
    }

    public constructor (options?: ImageryTileProviderOptions) {
        options = options || {};
        resetUrl(options);
        super(Object.assign({
            minimumLevel: 3,
            maximumLevel: 18
        }, options));
        this._token = options.token;
    }

}