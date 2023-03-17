import { Object3D } from "three";
import { EarthScene } from "./earth_scene";
import { FrameState } from "./frame_state";

/**
 * 基元
 */
export interface IPrimitive {
    id: string;
    //挂载到场景中的容器
    container: Object3D;
    destroy (): void;
    render (scene: EarthScene, frameState: FrameState): void;
}