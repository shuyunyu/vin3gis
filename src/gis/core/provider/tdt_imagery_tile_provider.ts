import { Utils } from "../../../core/utils/utils";
import { ImageryTileProviderOptions } from "./imagery_tile_provider_options";
import { UrlTemplateImageryProvider } from "./url_template_imagery_provider";

export class TdtImageryTileProvider extends UrlTemplateImageryProvider {

    //地图风格  Aerial:影像地图 street:街道地图 note:注记地图
    private _style: string = '';

    //地图密钥
    private _key: string = '';

    public minimumLevel: number = 3;

    public maximumLevel: number = 18;

    public get style () {
        return this._style;
    }

    constructor (imageryTileProviderOptions: ImageryTileProviderOptions) {
        super(imageryTileProviderOptions);
        this._style = Utils.defaultValue(imageryTileProviderOptions.style, 'Aerial');
        this._key = Utils.defaultValue(imageryTileProviderOptions.key, '');
        this._url = Utils.defaultValue(imageryTileProviderOptions.url, this.getUrlTemplate(this._style, this._key));
        this._subdomains = ['0', '1', '2', '3', '4', '5', '6', '7'];
    }

    /**
     * 获取模板Url
     */
    private getUrlTemplate (style: string, key: string) {
        let url = "";
        switch (style.toLocaleLowerCase()) {
            case 'aerial':
                url = 'https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk={key}';
                break;
            case 'street':
                url = 'https://t{s}.tianditu.gov.cn/vec_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={z}&layer=vec&style=default&tilerow={y}&tilecol={x}&tilematrixset=w&format=tiles&tk={key}';
                break;
            case 'note':
                url = 'https://t{s}.tianditu.gov.cn/cva_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={z}&layer=cva&style=default&tilerow={y}&tilecol={x}&tilematrixset=w&format=tiles&tk={key}';
                break;
            case 'fullnote':
                url = 'https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk={key}';
                break;
            case 'terrainstree':
                url = 'https://t{s}.tianditu.gov.cn/ter_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={z}&layer=ter&style=default&tilerow={y}&tilecol={x}&tilematrixset=w&format=tiles&tk={key}';
                break;
            default:
                break;
        }
        return url.replace('{key}', key);
    }


}