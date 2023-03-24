import { Euler, Matrix3, Matrix4, Plane, Vector3 } from "three";
import { VecConstants } from "../../../core/constants/vec_constants";
import { math } from "../../../core/math/math";
import { Utils } from "../../../core/utils/utils";
import { CoordinateOffsetType, ICartesian3Like } from "../../@types/core/gis";
import { Matrix4Utils } from "../../utils/matrix4_utils";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartographic } from "../cartographic";
import { Ellipsoid, EllipsoidWGS84 } from "../ellipsoid/ellipsoid";
import { InternalConfig } from "../internal/internal_config";
import { CoordinateTransform } from "../misc/crs/coordinate_transform";
import { IProjection } from "../projection/projection";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { FrameState } from "../scene/frame_state";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";

const scratchCartesian3 = new Cartesian3();
const scratchCartographic = new Cartographic();

const scratchCenter = new Cartesian3();

const swizzleMatrix = new Matrix4().fromArray([
    0.0,
    0.0,
    1.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
]);

const vectorProductLocalFrame: Record<string, Record<string, string>> = {
    up: {
        south: "east",
        north: "west",
        west: "south",
        east: "north",
    },
    down: {
        south: "west",
        north: "east",
        west: "north",
        east: "south",
    },
    south: {
        up: "west",
        down: "east",
        west: "down",
        east: "up",
    },
    north: {
        up: "east",
        down: "west",
        west: "up",
        east: "down",
    },
    west: {
        up: "north",
        down: "south",
        north: "down",
        south: "up",
    },
    east: {
        up: "south",
        down: "north",
        north: "up",
        south: "down",
    },
};

const localFrameToFixedFrameCache: Record<string, Function> = {};

const degeneratePositionLocalFrame: Record<string, number[]> = {
    north: [-1, 0, 0],
    east: [0, 1, 0],
    up: [0, 0, 1],
    south: [1, 0, 0],
    west: [0, -1, 0],
    down: [0, 0, -1],
};


const scratchFirstCartesian = new Cartesian3();
const scratchSecondCartesian = new Cartesian3();
const scratchThirdCartesian = new Cartesian3();

const scratchFromENU = new Matrix4();
const scratchRotation = new Matrix3();
const scratchToENU = new Matrix4();

const scratchTransfrom = new Matrix4();

const scratchCalculateCartesian: Record<string, Cartesian3> = {
    east: new Cartesian3(),
    north: new Cartesian3(),
    up: new Cartesian3(),
    west: new Cartesian3(),
    south: new Cartesian3(),
    down: new Cartesian3(),
};

let METERS_SCALE: Vector3;

export class Transform {
    //每一个threejs单位 代表实际的多少米
    //100 => 1 threejs单位 表示实际的1米
    public static THREEJS_UNIT_PER_METERS: number = 10000;

    //定义地图平面
    public static readonly MAP_PLANE = new Plane(VecConstants.UNIT_Y_VEC3);

    //旋转矩阵
    public static readonly ROTATE_MAT = Object.freeze(new Matrix4().makeRotationFromEuler(new Euler(-math.PI_OVER_TWO)));

    /**
     * 获取 每单位 threejs距离 代表的实际地理距离
     */
    public static getMetersPerUnit () {
        return this.THREEJS_UNIT_PER_METERS;
    }

    /**
     * 获取 缩放比例矢量
     */
    public static getMetersScale () {
        if (METERS_SCALE !== undefined) {
            return METERS_SCALE;
        }
        let scale = 1 / this.getMetersPerUnit();
        METERS_SCALE = new Vector3(scale, scale, scale);
        return METERS_SCALE;
    }

    /**
     * 转换单个笛卡尔坐标为THREEJSZ中的坐标
     * @param val 
     * @returns 
     */
    public static carCoordToWorldCoord (val: number) {
        return val / this.THREEJS_UNIT_PER_METERS;
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
     * 转换地球上的mat3到世界坐标中的mat3
     * @param mat3 
     * @param out 
     * @returns 
     */
    public static earthMatrix3ToWorldMatrix3 (mat3: Matrix3, out?: Matrix3) {
        const mat4 = scratchTransfrom.setFromMatrix3(mat3);
        mat4.multiply(this.ROTATE_MAT);
        out = out || new Matrix3();
        out.setFromMatrix4(mat4);
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
    public static geoCar3ToWorldCar3 (cartesian3: Cartesian3, out?: Cartesian3) {
        let metersPerUnit = this.getMetersPerUnit();
        let result = this.earthCar3ToWorldCar3(cartesian3, out);
        result.multiplyScalar(1 / metersPerUnit);
        return result;
    }

    /**
     * 将地理空间坐标转换为threejs中的坐标
     * vec3 / 缩放值
     * @param cartesian3 
     * @returns 
     */
    public static geoCar3ToWorldVec3 (cartesian3: Cartesian3, out?: Vector3) {
        let metersPerUnit = this.getMetersPerUnit();
        let result = this.earthCar3ToWorldVec3(cartesian3, out);
        result.multiplyScalar(1 / metersPerUnit);
        return result;
    }

    /**
     * 将地理空间经纬度高度坐标转换为threejs中的坐标
     * @param cartographic 
     * @param tilingScheme 
     * @returns 
     */
    public static cartographicToWorldCar3 (cartographic: Cartographic, tilingScheme: ITilingScheme, out?: Cartesian3) {
        let cartesian3 = tilingScheme.projection.project(cartographic);
        return this.geoCar3ToWorldCar3(cartesian3, out);
    }

    /**
     * 将地理空间经纬度高度坐标转换为threejs中的坐标
     * @param cartographic 
     * @param tilingScheme 
     * @returns 
     */
    public static cartographicToWorldVec3 (cartographic: Cartographic, tilingScheme: ITilingScheme, out?: Vector3) {
        let cartesian3 = tilingScheme.projection.project(cartographic);
        return this.geoCar3ToWorldVec3(cartesian3, out);
    }

    /**
     * 将threejs中的坐标转换为世界空间下的cartographic
     * @param worldVec3 
     * @param tilingScheme 
     * @returns 
     */
    public static worldCar3ToCartographic (worldVec3: ICartesian3Like, tilingScheme: ITilingScheme, out?: Cartographic) {
        let metersPerUnit = this.getMetersPerUnit();
        let cartesian3 = this.worldCar3ToEarthVec3(worldVec3, scratchCartesian3);
        cartesian3.multiplyScalar(metersPerUnit);
        return tilingScheme.projection.unproject(cartesian3, out);
    }

    /**
     * 将ECEF坐标系下的car3转换为cartographic
     * @param car3 
     * @param tilingScheme 
     * @param out 
     * @returns 
     */
    public static ecefCar3ToCartographic (car3: ICartesian3Like, tilingScheme: ITilingScheme, out?: Cartographic) {
        //@ts-ignore
        return tilingScheme.projection.ellipsoid.cartesianToCartographic(car3, out);
    }

    /**
     * 将ECEF坐标系下的car3转换为2D地球上的car3
     * @param car3 
     * @param tilingScheme 
     * @param out 
     * @returns 
     */
    public static ecefCar3ToEarthCar3 (car3: ICartesian3Like, tilingScheme: ITilingScheme, out?: Cartesian3) {
        const cartographic = this.ecefCar3ToCartographic(car3, tilingScheme, scratchCartographic);
        return tilingScheme.projection.project(cartographic, out);
    }


    /**
     * 转换WGS84坐标
     * @param projection 
     * @param cartesian 
     * @param coordinateOffsetType 
     * @param out 
     * @returns 
     */
    public static wgs84ToCartesian (projection: IProjection, cartesian: Cartesian3, coordinateOffsetType: CoordinateOffsetType, out?: Cartesian3) {
        let cartographic = projection.unproject(cartesian, scratchCartographic);
        let transformed = this.wgs84ToCartographic(cartographic, coordinateOffsetType, cartographic);
        return projection.project(transformed, out);
    }

    /**
     * 转换WGS84坐标
     * @param cartographic 
     * @param coordinateOffsetType 
     * @param out
     */
    public static wgs84ToCartographic (cartographic: Cartographic, coordinateOffsetType: CoordinateOffsetType, out?: Cartographic) {
        if (coordinateOffsetType === CoordinateOffsetType.NONE) return cartographic;
        let lng = math.toDegree(cartographic.longitude);
        let lat = math.toDegree(cartographic.latitude);
        out = out || new Cartographic();
        let resLng: number = 0;
        let resLat: number = 0;
        if (coordinateOffsetType === CoordinateOffsetType.GCJ02) {
            let res = CoordinateTransform.wgs84togcj02(lng, lat);
            resLng = res[0];
            resLat = res[1];
        } else if (coordinateOffsetType === CoordinateOffsetType.BD09) {
            let res = CoordinateTransform.wgs84tobd09(lng, lat);
            resLng = res[0];
            resLat = res[1];
        }
        out.longitude = math.toRadian(resLng);
        out.latitude = math.toRadian(resLat);
        out.height = cartographic.height;
        return out;
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
        let sseDenominator = frameState.sseDenominator;
        let height = frameState.drawContextHeihgt;
        let tileDistance = this.computeCameraDinstanceToTile(tile, frameState);
        return (maxGeometricError * height) / (tileDistance * sseDenominator);
    }


    /**
     * 验证瓦片的精度是否符合要求
     */
    public static validateSpaceError (tile: QuadtreeTile, imageryTileProvider: IImageryTileProvider, frameState: FrameState) {
        let error = this.computeSpaceError(imageryTileProvider, tile, frameState);
        return error < InternalConfig.SPACE_ERROR;
    }



    /**
     * 基础2d变换
     * @param projection 
     * @param matrix 
     * @param result 
     */
    public static basisTo2D (projection: IProjection, matrix: Matrix4, result: Matrix4) {
        let rtcCenter = Matrix4Utils.getTranslation(matrix, scratchCenter);
        let ellipsoid = projection.ellipsoid;
        // Get the 2D Center
        let cartographic = ellipsoid.cartesianToCartographic(rtcCenter, scratchCartographic);
        let projectedPosition = projection.project(cartographic);
        // Assuming the instance are positioned in WGS84, invert the WGS84 transform to get the local transform and then convert to 2D
        let fromENU = this.eastNorthUpToFixedFrame(rtcCenter, ellipsoid, scratchFromENU);
        let toENU = Matrix4Utils.inverseTransformation(fromENU, scratchToENU);
        let rotation = Matrix4Utils.getMatrix3(matrix, scratchRotation);
        let local = Matrix4Utils.multiplyByMatrix3(toENU, rotation, result);
        // Mat4.multiply(result, local, result);
        result.premultiply(local);
        Matrix4Utils.setTranslation(result, projectedPosition, result);

        return result;
    }

    public static wgs84To2DModelMatrix (projection: IProjection, center: Cartesian3, result: Matrix4) {
        let ellipsoid = projection.ellipsoid;
        let fromENU = this.eastNorthUpToFixedFrame(center, ellipsoid, scratchFromENU);
        let toENU = Matrix4Utils.inverseTransformation(fromENU, scratchToENU);
        let cartographic = ellipsoid.cartesianToCartographic(center, scratchCartographic);
        let projectedPosition = projection.project(cartographic!);
        let translation = scratchFromENU.identity().makeTranslation(projectedPosition.x, projectedPosition.y, projectedPosition.z);
        result.copy(swizzleMatrix).multiply(toENU);
        Matrix4Utils.multiply(translation, result, result);
        return result;
    }

    public static eastNorthUpToFixedFrame (origin: Cartesian3, ellipsoid?: Ellipsoid, result?: Matrix4) {
        return this.localFrameToFixedFrameGenerator("east", "north").apply(this, [origin, ellipsoid, result]);
    }

    public static northEastDownToFixedFrame (origin: Cartesian3, ellipsoid?: Ellipsoid, result?: Matrix4) {
        return this.localFrameToFixedFrameGenerator("north", "east").apply(this, [origin, ellipsoid, result]);
    }

    public static northUpEastToFixedFrame (origin: Cartesian3, ellipsoid?: Ellipsoid, result?: Matrix4) {
        return this.localFrameToFixedFrameGenerator("north", "up").apply(this, [origin, ellipsoid, result]);
    }

    public static northWestUpToFixedFrame (origin: Cartesian3, ellipsoid?: Ellipsoid, result?: Matrix4) {
        return this.localFrameToFixedFrameGenerator("north", "west").apply(this, [origin, ellipsoid, result]);
    }

    /**
     * Generates a function that computes a 4x4 transformation matrix from a reference frame
     * centered at the provided origin to the provided ellipsoid's fixed reference frame.
     * @param firstAxis 
     * @param secondAxis 
     */
    private static localFrameToFixedFrameGenerator (firstAxis: string, secondAxis: string): Function {
        let thirdAxis = vectorProductLocalFrame[firstAxis][secondAxis];
        let resultat;
        let hashAxis = firstAxis + secondAxis;
        if (Utils.defined(localFrameToFixedFrameCache[hashAxis])) {
            resultat = localFrameToFixedFrameCache[hashAxis];
        } else {
            resultat = function (origin: Cartesian3, ellipsoid?: Ellipsoid, result?: Matrix4) {
                if (
                    Cartesian3.equalsEpsilon(origin, Cartesian3.ZERO, math.EPSILON14)
                ) {
                    // If x, y, and z are zero, use the degenerate local frame, which is a special case
                    Cartesian3.unpack(degeneratePositionLocalFrame[firstAxis], 0, scratchFirstCartesian);
                    Cartesian3.unpack(degeneratePositionLocalFrame[secondAxis], 0, scratchSecondCartesian);
                    Cartesian3.unpack(degeneratePositionLocalFrame[thirdAxis], 0, scratchThirdCartesian);
                } else if (
                    math.equalsEpsilon(origin.x, 0.0, math.EPSILON14) &&
                    math.equalsEpsilon(origin.y, 0.0, math.EPSILON14)
                ) {
                    // If x and y are zero, assume origin is at a pole, which is a special case.
                    let sign = Math.sign(origin.z);

                    Cartesian3.unpack(degeneratePositionLocalFrame[firstAxis], 0, scratchFirstCartesian);
                    if (firstAxis !== "east" && firstAxis !== "west") {
                        Cartesian3.multiplyScalar(
                            scratchFirstCartesian, scratchFirstCartesian, sign);
                    }

                    Cartesian3.unpack(degeneratePositionLocalFrame[secondAxis], 0, scratchSecondCartesian);
                    if (secondAxis !== "east" && secondAxis !== "west") {
                        Cartesian3.multiplyScalar(scratchSecondCartesian, scratchSecondCartesian, sign);
                    }

                    Cartesian3.unpack(degeneratePositionLocalFrame[thirdAxis], 0, scratchThirdCartesian);
                    if (thirdAxis !== "east" && thirdAxis !== "west") {
                        Cartesian3.multiplyScalar(scratchThirdCartesian, scratchThirdCartesian, sign
                        );
                    }
                } else {
                    ellipsoid = Utils.defaultValue(ellipsoid, EllipsoidWGS84);
                    ellipsoid!.geodeticSurfaceNormal(origin, scratchCalculateCartesian.up);

                    let up = scratchCalculateCartesian.up;
                    let east = scratchCalculateCartesian.east;
                    east.x = -origin.y;
                    east.y = origin.x;
                    east.z = 0.0;
                    Cartesian3.normalize(scratchCalculateCartesian.east, east);
                    Cartesian3.cross(scratchCalculateCartesian.north, up, east);

                    Cartesian3.multiplyScalar(scratchCalculateCartesian.down, scratchCalculateCartesian.up, -1,
                    );
                    Cartesian3.multiplyScalar(scratchCalculateCartesian.west, scratchCalculateCartesian.east, -1);
                    Cartesian3.multiplyScalar(scratchCalculateCartesian.south, scratchCalculateCartesian.north, -1);

                    scratchFirstCartesian.set(scratchCalculateCartesian[firstAxis]);
                    scratchSecondCartesian.set(scratchCalculateCartesian[secondAxis]);
                    scratchThirdCartesian.set(scratchCalculateCartesian[thirdAxis]);
                }
                result.elements[0] = scratchFirstCartesian.x;
                result.elements[1] = scratchFirstCartesian.y;
                result.elements[2] = scratchFirstCartesian.z;
                result.elements[3] = 0.0;
                result.elements[4] = scratchSecondCartesian.x;
                result.elements[5] = scratchSecondCartesian.y;
                result.elements[6] = scratchSecondCartesian.z;
                result.elements[7] = 0.0;
                result.elements[8] = scratchThirdCartesian.x;
                result.elements[9] = scratchThirdCartesian.y;
                result.elements[10] = scratchThirdCartesian.z;
                result.elements[11] = 0.0;
                result.elements[12] = origin.x;
                result.elements[13] = origin.y;
                result.elements[14] = origin.z;
                result.elements[15] = 1.0;
                return result;
            };
            localFrameToFixedFrameCache[hashAxis] = resultat;
        }
        return resultat;
    }

}