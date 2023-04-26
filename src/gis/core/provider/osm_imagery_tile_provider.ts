import { Utils } from "../../../core/utils/utils";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

/**
 * osm 瓦片地图提供者
 */
export class OSMImageryTileProvider extends UrlTemplateImageryProvider {

    public constructor (options?: ImageryTileProviderOptions) {
        options = options || {};
        super(Object.assign({
            minimumLevel: 3,
            maximumLevel: 18
        }, options));
        this._url = Utils.defaultValue(options.url, "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
        this._subdomains = Utils.defaultValue(options.subdomains, ['a', 'b', 'c']);
    }

}