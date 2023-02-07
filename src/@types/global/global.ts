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

/**
 * 可调度对象接口
 * - 实现此接口可以被调度系统调用
 */
export interface ISchedulable {
    //对象的唯一标识
    uuid: string;
    //优先级
    priority: number;
    //对象每次被调度器调用时执行的函数
    update: (deltaTime: number) => void;
}

/**
 * 表示一个矩形范围
 */
export type RectangleRange = {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
}