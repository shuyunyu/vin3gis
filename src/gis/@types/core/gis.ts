export interface ICartesian2Like {
    x: number;
    y: number;
}

export interface ICartesian3Like extends ICartesian2Like {
    z: number;
}

export interface ICartesian4Like extends ICartesian3Like {
    w: number;
}

export interface IQuatLike {
    x: number;
    y: number;
    z: number;
    w: number;
}