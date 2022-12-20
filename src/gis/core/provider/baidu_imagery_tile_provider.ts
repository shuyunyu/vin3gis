import { Utils } from "../../../core/utils/utils";
import { BD09MercatorTilingScheme } from "../tilingscheme/bd09_mercator_tiling_scheme";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

export class BaiduImageryTileProvider extends UrlTemplateImageryProvider {

    public minimumLevel: number = 3;

    public maximumLevel: number = 18;

    private _style: string;

    public constructor (options?: ImageryTileProviderOptions) {
        options = Object.assign({}, options, { tilingScheme: new BD09MercatorTilingScheme() });
        super(options);
        this._style = Utils.defaultValue(options.style, 'street');
        this._url = this.getUrlTemplate(this._style);
        this._subdomains = ['0', '1', '2', '3'];
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

