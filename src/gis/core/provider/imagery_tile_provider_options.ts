import { Rectangle } from "../geometry/rectangle";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";

export interface ImageryTileProviderOptions {
    //可见性
    visible?: boolean;
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
    subdomain?: string[];
    //key for tdt
    key?: string;
    //token for arcgis
    token?: string;
    //风格
    style?: string;
}