import { Matrix4 } from "three";
import { AssetDefines } from "../../../@types/core/asset/asset";
import { DRACOLoader } from "../../../core/loader/draco_loader";
import { KTX2Loader } from "../../../core/loader/ktx2_loader";
import { Utils } from "../../../core/utils/utils";
import { XHRRequestOptions } from "../../../core/xhr/xhr_request";
import { Earth3DTile } from "../../core/scene/3dtileset/earth_3dtile";
import { Earth3DTileset } from "../../core/scene/3dtileset/earth_3dtileset";
import { PointCloudShading } from "../../core/scene/3dtileset/pointcloud_shading";
import { CoordinateOffsetType } from "./gis";

/**
 * Earth3DTileset类构造参数
 */
export interface Earth3DTilesetOptions {
    //3dtiles地址 tileset.json地址
    url: string;
    //坐标偏移类型
    coordinateOffsetType?: CoordinateOffsetType;
    dracoLoader?: DRACOLoader;
    ktx2Loader?: KTX2Loader;
    //模型变换矩阵
    modelMatrix?: Matrix4;
    //是否显示 defalt true
    show?: boolean;
    //最大屏幕空间误差
    maximumScreenSpaceError?: number;
    //是否在隐藏的时候进行资源加载 default false
    preloadWhenHidden?: boolean;
    //在相机飞行目的地加载资源 default true
    preloadFlightDestinations?: boolean;
    //0-0.5之间的值  用来优化不同分辨率设备上 贴图的加载
    progressiveResolutionHeightFraction?: number;
    //优化选择 确定遍历期间是否跳过细节选择
    skipLevelOfDetail?: boolean;
    //是否优先加载叶子节点
    preferLeaves?: boolean;
    //是否启用漏斗屏幕空间误差
    foveatedScreenSpaceError?: boolean;
    foveatedInterpolationCallback?: Function;
    foveatedMinimumScreenSpaceErrorRelaxation?: number;
    foveatedConeSize?: number;
    immediatelyLoadDesiredLevelOfDetail?: boolean;
    //是否在遍历的时候加载兄弟节点
    loadSiblings?: boolean;
    skipScreenSpaceErrorFactor?: number;
    skipLevels?: number;
    maximumMemoryUsage?: number;
    baseScreenSpaceError?: number;
    assetLoadParams?: AssetDefines.LoadAssetParams;
    pointCloudShading?: PointCloudShading;
}


/**
 * Earth3DTile类的构造参数
 */
export interface Earth3DTileOptions {
    tileset: Earth3DTileset;
    baseUrl: string;
    header: any;//tile 的 json描述
    parent?: Earth3DTile;
    tilesetResourceUri?: string;
}


//tileset中规定的 gtlf向上的轴
export enum Earth3DTilesetGltfUpAxis {
    Y = 1,
    Z
}

//3DTILE替换类型
export enum Earth3DTileRefine {
    REPLACE = 1,
    ADD
}

/**
 * 判断 是否包含某个扩展
 * @param json 
 * @param extensionName 
 * @returns 
 */
export function has3DTilesExtension (json: any, extensionName: string) {
    return Utils.defined(json) && Utils.defined(json.extensions) && json.extensions[extensionName];
}

//3dtile content 状态枚举
export enum Earth3DTileContentState {
    UNLOADED = 1, // Has never been requested
    LOADING, // Is waiting on a pending request
    PROCESSING, // Request received.  Contents are being processed for rendering.  Depending on the content, it might make its own requests for external data.
    READY, // Ready to render.
    EXPIRED, // Is expired and will be unloaded once new content is loaded.
    FAILED, // Request failed.
};

export interface Earth3DTilesetPriority {
    foveatedFactor: number;
    depth: number;
    distance: number;
    reverseScreenSpaceError: number;
}

export enum Earth3DTileOptimizationHint {
    NOT_COMPUTED = 1,
    USE_OPTIMIZATION,
    SKIP_OPTIMIZATION,
}