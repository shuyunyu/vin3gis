import { Quaternion, Vector3 } from "three";

export type DeepPartial<T> = T extends Function
    ? T
    : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

export type Constructor<T = unknown> = new (...args: any[]) => T;

export type Partial<T> = T extends Function
    ? T :
    T extends object
    ? { [P in keyof T]?: T[P] } : T;

export type RTS = {
    rotation: Quaternion;
    position: Vector3;
    scale: Vector3;
}

export type PerspectiveCameraProps = {
    near?: number;
    far?: number;
    fov?: number;
    aspect?: number;
}

export type OrthographicCameraProps = {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    near?: number;
    far?: number;
}