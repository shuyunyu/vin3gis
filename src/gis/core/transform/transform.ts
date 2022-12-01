import { Vector3 } from "three";
import { math } from "../../../core/math/math";
import { Utils } from "../../../core/utils/utils";
import { ICartesian3Like } from "../../@types/core/gis";
import { Cartesian3 } from "../cartesian/cartesian3";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { FrameState } from "../scene/frame_state";
import { QuadtreeTile } from "../scene/quad_tree_tile";

export class Transform {
    //每一个threejs单位 代表实际的多少米
    //100 => 1 threejs单位 表示实际的1米
    public static THREEJS_UNIT_PER_METERS: number = 100;

    /**
     * 获取 每单位 threejs距离 代表的实际地理距离
     */
    public static getMetersPerUnit () {
        return this.THREEJS_UNIT_PER_METERS;
    }

    /**
     * 转换地球上的Cartesian3为世界坐标中的Cartesian3。
     * 由于取Y平面作为地图平面，而实际上地图平面为Z平面 所以需要转换一下
     * 将car3转换为地图平面(Y)上的坐标
     */
    public static earthCar3ToWorldCar3 (vec3: ICartesian3Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        Cartesian3.rotateX(out, vec3, Cartesian3.ZERO, -math.PI_OVER_TWO);
        return out;
    }

    /**
     * 转换地球上的Cartesian3为世界坐标中的Cartesian3。
     * 由于取Y平面作为地图平面，而实际上地图平面为Z平面 所以需要转换一下
     * 将car3转换为地图平面(Y)上的坐标
     */
    public static earthCar3ToWorldVec3 (vec3: ICartesian3Like, out?: Vector3) {
        out = out || new Vector3();
        Cartesian3.rotateX(out, vec3, Cartesian3.ZERO, -math.PI_OVER_TWO);
        return out;
    }

    /**
     * 转换threejs中的vec3到 地球上的vec3
     * 由于取Y平面作为地图平面，而实际上地图平面为Z平面 所以需要转换一下
     * @param vec3 
     * @returns 
     */
    public static worldCar3ToEarthVec3 (vec3: ICartesian3Like, out?: Cartesian3) {
        out = out || new Cartesian3();
        Cartesian3.rotateX(out, vec3, Cartesian3.ZERO, math.PI_OVER_TWO);
        return out;
    }

    /**
     * 将threejs中的坐标转换为地理世界空间下的cartesian3
     * vec3 * 缩放值
     * @param worldVec3 
     * @param out 
     * @returns 
     */
    public static worldCar3ToGeoCar3 (worldVec3: ICartesian3Like, out?: Cartesian3) {
        let metersPerUnit = this.getMetersPerUnit();
        let result = this.worldCar3ToEarthVec3(worldVec3, out);
        result.multiplyScalar(metersPerUnit);
        return result;
    }

    /**
     * 将地理空间坐标转换为threejs中的坐标
     * vec3 / 缩放值
     * @param cartesian3 
     * @returns 
     */
    public static geoCart3ToWorldVec3 (cartesian3: Cartesian3, out?: Cartesian3) {
        let metersPerUnit = this.getMetersPerUnit();
        let result = this.earthCar3ToWorldCar3(cartesian3, out);
        result.multiplyScalar(1 / metersPerUnit);
        return result;
    }

    /**
     * 计算摄像机到瓦片的距离
     * @param quadtreeTile 
     */
    public static computeCameraDinstanceToTile (quadtreeTile: QuadtreeTile, frameState: FrameState) {
        if (!Utils.defined(quadtreeTile.distanceToCamera)) {
            quadtreeTile.updateDistanceToCamera(frameState);
        }
        return quadtreeTile.distanceToCamera!;
    }

    /**
     * 计算空间误差
     * @param imageryTileProvider 
     * @param tile 
     * @param frameState 
     * @returns 
     */
    public static computeSpaceError (imageryTileProvider: IImageryTileProvider, tile: QuadtreeTile, frameState: FrameState) {
        //当前等级下 1像素多少米
        let maxGeometricError = imageryTileProvider.getLevelMaximumGeometricError(tile.level);
        let seeDenominator = frameState.sseDenominator;
        let height = frameState.domEle.clientHeight;
        let L = maxGeometricError * (height / seeDenominator);
        let tileDistance = this.computeCameraDinstanceToTile(tile, frameState);
        return L / tileDistance;
    }


    /**
     * 验证瓦片的精度是否符合要求
     */
    public static validateSpaceError (tile: QuadtreeTile, imageryTileProvider: IImageryTileProvider, frameState: FrameState) {
        let error = this.computeSpaceError(imageryTileProvider, tile, frameState);
        // return error < (sys.isMobile ? 3 : );
        return error < 2;
    }

}