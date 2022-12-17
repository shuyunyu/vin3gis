import { ControlsProperty } from "../controls/controls"

//系统事件类型
export enum SystemEventType {
    MOUSE_DOWN = "mousedown",
    MOUSE_MOVE = "mousemove",
    MOUSE_UP = "mouseup",
    MOUSE_WHEEL = "mousewheel",

    TOUCH_START = "touchstart",
    TOUCH_MOVE = "touchmove",
    TOUCH_END = "touchend",
    TOUCH_CANCEL = "touchcancel",

    KEY_DOWN = "keydown",
    KEY_UP = "keyup",
    KEY_PRESS = "keypress"
}


export namespace SystemDefines {

    //系统优先级
    export enum Priority {
        DISPOSE_SYSTEM = Infinity,
        HIGH = 200,
        EVENT_SYSTEM = 195,
        INTERACTION = 190,
        TWEEN = 180,
        SCHEDULE = 170,
        REQUEST = 150,
        MEDIUM = 100,
        LOW = 0
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

    export type InputEventListenerParams<T> =
        T extends SystemEventType.MOUSE_DOWN ? MouseEvent :
        T extends SystemEventType.MOUSE_UP ? MouseEvent :
        T extends SystemEventType.MOUSE_MOVE ? MouseEvent :
        T extends SystemEventType.MOUSE_WHEEL ? WheelEvent :
        T extends SystemEventType.TOUCH_START ? TouchEvent :
        T extends SystemEventType.TOUCH_END ? TouchEvent :
        T extends SystemEventType.TOUCH_MOVE ? TouchEvent :
        T extends SystemEventType.TOUCH_CANCEL ? TouchEvent :
        T extends SystemEventType.KEY_DOWN ? KeyboardEvent :
        T extends SystemEventType.KEY_UP ? KeyboardEvent :
        T extends SystemEventType.KEY_PRESS ? KeyboardEvent :
        never

    export interface Disposable {
        dispose: () => void;
    }

}