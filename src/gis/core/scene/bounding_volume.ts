import { Sphere, Vector3 } from "three";
import { FrameState } from "./frame_state";

/**
 * 定义边界体
 */
export interface IBoundingVolume {
    //包围球
    boundingSphere: Sphere;
    //边界球中心点 worldVec3  避免实时计算
    boundingSphereCenter: Vector3;
    //边界球半径  worldUnit  避免实时计算
    boundingSphereRadius: number;
    //边界球volume worldUnit 避免实时计算
    boundingSphereVolume: number;
    //距离摄像机的距离(米)
    distanceToCamera (frameState: FrameState): number;
    //计算可见性
    computeVisible (frameState: FrameState): boolean;
}
