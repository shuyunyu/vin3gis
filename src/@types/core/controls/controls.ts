import { MOUSE } from "three";
import { DeepPartial } from "../partial";

export interface IControlsProperty {
    enabled: boolean;
    dampingFactor: number;
    enableDamping: boolean;
    enablePan: boolean;
    enableRotate: boolean;
    enableZoom: boolean;
    mouseButtons: { [key in 'LEFT' | 'MIDDLE' | 'RIGHT']: MOUSE.PAN | MOUSE.ROTATE | MOUSE.DOLLY | undefined }
}

export interface IOrbitControls extends IControlsProperty {
    reset: () => void;
    saveState: () => void;
    dispose: () => void;
    update: () => void;
}

export type ControlsProperty = DeepPartial<IControlsProperty>;