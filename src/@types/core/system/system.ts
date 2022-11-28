import { ControlsProperty } from "../controls/controls"

export namespace SystemDefines {

    //系统优先级
    export enum Priority {
        LOW = 0,
        MEDIUM = 100,
        HIGH = 200,
        INTERACTION = 190,
        REQUEST = 150
    }

    //请求任务类型
    export enum RequestTaskeType {
        IMAGE = "image",
        RASTER_TILE = "raster_tile",
        JSON = "json",
        BLOB = "blob",
        ARRAYBUFFER = "arraybuffer",
        OTHER = "other"
    }

    //交互类型
    export enum InteractionType {
        ORBIT,
        MAP
    }

    //渲染配置
    export type InteractionConfig = {
        type: InteractionType,
        prop: ControlsProperty
    }

}