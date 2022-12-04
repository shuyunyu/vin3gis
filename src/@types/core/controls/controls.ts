import { MOUSE, Vector3 } from "three";
import { DeepPartial } from "../../global/global";

export interface IControlsProperty {
    enabled: boolean;
    dampingFactor: number;
    enableDamping: boolean;
    enablePan: boolean;
    enableRotate: boolean;
    enableZoom: boolean;
    target: Vector3;
    target0: Vector3;
    shouldLookAt: boolean;
    minPolarAngle: number;
    maxPolarAngle: number;
    mouseButtons: { [key in 'LEFT' | 'MIDDLE' | 'RIGHT']: MOUSE.PAN | MOUSE.ROTATE | MOUSE.DOLLY | undefined }
}

export interface IOrbitControls extends IControlsProperty {
    reset: () => void;
    saveState: () => void;
    dispose: () => void;
    update: () => void;
}

export type ControlsProperty = DeepPartial<IControlsProperty>;