import { Color, DoubleSide, MeshBasicMaterial } from "three";
import { math } from "../../../core/math/math";

/**
 * 存放一些内部公用的配置
 */
export class InternalConfig {

    //标识是否开启debug模式
    public static DEBUG = true;

    /**
     * 相机的最大倾角
     */
    public static MAX_PITCH = 0;

    /**
     * 相机的最小倾角
     */
    public static MIN_PITCH = -math.PI_OVER_TWO;

    /**
     * 相机视角最低高度(米)
     */
    public static MIN_DISTANCE = 0;

    /**
     * 相机视角最大高度(米)
     */
    public static MAX_DISTANCE = 100000000;

    /**
     * 瓦片mtl texture缓存尺寸
     */
    public static TILE_TEXTURE_MTL_CACHE_SIZE = 100;

    //SSE
    public static SPACE_ERROR = 2;

    //mapview的渲染fps
    public static VIEWER_RENDER_FPS = 30;

    //默认相机的fov
    public static DEFAULT_CAMERA_FOV = 60;

    //是否开启图片瓦片的fadeout效果
    public static ENABLE_IMAGEY_TILE_FADE_OUT = false;

    //默认最大瓦片缓存数量
    public static DEFAUTL_MAX_TILE_CACHE_COUNT = 1000;

    //是否在webWorker中加载瓦片贴图
    public static REQUEST_RASTER_TILE_IN_WORKER = true;

    //sprite贴图集尺寸
    public static SPRITE_TEXTURE_ATLAS_SIZE = 1024;

    //sprite贴图集最小瓦片贴图尺寸
    public static SPRITE_TEXTURE_ATLAS_MIN_TILE_SIZE = 8;

    //sprite贴图集最大瓦片贴图尺寸
    public static SPRITE_TEXTURE_ATLAS_MAX_TILE_SIZE = 512;

    //默认雾的颜色
    public static DEFAULT_FOG_COLOR = 0xFFFFFF;

    //默认雾的密度
    public static DEFAULT_FOG_DENSITY = 0.0002;

    //是否显示3dtile的包围盒
    public static SHOW_3DTILE_BOUNDING_VOLUME = false;

    //3dtiles重投影webworker个数
    public static REPROJECT_WORKER_COUNT = 4;

    /**
     * 校验相机的pitch是否有效
     * @param pitch 
     * @returns 
     */
    public static checkCameraPitch (pitch: number) {
        return pitch >= this.MIN_PITCH && pitch <= this.MAX_PITCH;
    }

    /**
     * 夹紧相机的倾角
     * @param pitch 
     * @returns 
     */
    public static clampCameraPitch (pitch: number) {
        return math.clamp(pitch, this.MIN_PITCH, this.MAX_PITCH);
    }

    /**
     * 获取3dtile包围盒显示材质
     */
    public static get3dtileBoundingVolumeMaterial () {
        return new MeshBasicMaterial({
            color: new Color('#FF0000'),
            wireframe: true,
            side: DoubleSide,
            transparent: true,
            depthTest: false,
        })
    }

}