import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

/**
 * osm 瓦片地图提供者
 */
export class OSMImageryTileProvider extends UrlTemplateImageryProvider {

    public constructor (options?: ImageryTileProviderOptions) {
        options = options || {};
        super(options);
        this._url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        this._subdomains = ['a', 'b', 'c'];
    }

}