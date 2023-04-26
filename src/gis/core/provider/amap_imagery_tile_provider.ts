import { Utils } from "../../../core/utils/utils";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

export class AMapImageryTileProvider extends UrlTemplateImageryProvider {
    //地图风格  Aerial:影像地图 street:街道地图 note:注记地图
    private _style: string = '';

    public get style () {
        return this._style;
    }

    constructor (options?: ImageryTileProviderOptions) {
        options = options || {};
        super(Object.assign({
            minimumLevel: 3,
            maximumLevel: 18
        }, options));
        this._style = Utils.defaultValue(options?.style, 'Aerial');
        this._url = Utils.defaultValue(options.url, this.getUrlTemplate(this._style));
        this._subdomains = Utils.defaultValue(options.subdomains, ['1', '2', '3', '4']);
    }

    /**
     * 获取模板Url
     */
    private getUrlTemplate (style: string) {
        let url = "";
        switch (style.toLocaleLowerCase()) {
            case 'aerial':
                url = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
                break;
            case 'street':
                url = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
                break;
            case 'note':
                url = 'https://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8';
                break;
            default:
                break;
        }
        return url;
    }

}