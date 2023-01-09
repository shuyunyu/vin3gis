import { Rectangle } from "../geometry/rectangle";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";

export interface ImageryTileProviderOptions {
    //是否是tms类型瓦片地图 default fasle
    tms?: boolean;
    //可见性
    visible?: boolean;
    //不透明度
    opacity?: number;
    //格式
    format?: string;
    //最大缩放等级
    maximumLevel?: number;
    //最小缩放等级
    minimumLevel?: number;
    //瓦片宽度
    tileWidth?: number;
    //瓦片高度
    tileHeight?: number;
    //瓦片方案
    tilingScheme?: ITilingScheme;
    //瓦片范围
    rectangle?: Rectangle;
    //url
    url?: string;
    //subdomain
    subdomains?: string[];
    //key for tdt
    key?: string;
    //token for arcgis
    token?: string;
    //风格
    style?: string;
    //标识是否在WebWorker中请求瓦片图片  default true
    requestTileImageInWorker?: boolean;
}