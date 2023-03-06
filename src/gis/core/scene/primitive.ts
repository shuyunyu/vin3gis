import { EarthScene } from "./earth_scene";
import { FrameState } from "./frame_state";

/**
 * 基元
 */
export interface IPrimitive {
    id: string;
    destroy (): void;
    render (scene: EarthScene, frameState: FrameState): void;
}