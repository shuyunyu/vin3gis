import { SystemDefines, SystemEventType } from "../../@types/core/system/system";
import { Event } from "../event/event";

/**
 * 管理设备输入
 * - 用来绑定事件
 */
export class Input extends Event {

    public readonly dom: HTMLElement;

    private _listenerMap: Record<string, Function> = Object.create(null);

    public constructor (dom: HTMLElement) {
        super();
        this.dom = dom;
        this.init();
    }

    public addEventListener<T extends SystemEventType> (event: T, listener: (event: SystemDefines.InputEventListenerParams<T>) => void, context?: any): void {
        super.addEventListener(event, listener, context);
    }

    public removeEventListener<T extends SystemEventType> (event: T, listener: (event: SystemDefines.InputEventListenerParams<T>) => void, context?: any): void {
        super.removeEventListener(event, listener, context);
    }

    public once<T extends SystemEventType> (event: T, listener: (event: SystemDefines.InputEventListenerParams<T>) => void, context?: any): void {
        super.once(event, listener, context);
    }

    public on<T extends SystemEventType> (event: T, listener: (event: SystemDefines.InputEventListenerParams<T>) => void, context?: any): void {
        super.on(event, listener, context);
    }

    public off<T extends SystemEventType> (event: T, listener: (event: SystemDefines.InputEventListenerParams<T>) => void, context?: any): void {
        super.off(event, listener, context);
    }

    public dispatchEvent<T extends SystemEventType> (event: T, arg: SystemDefines.InputEventListenerParams<T>): void {
        super.dispatchEvent(event, arg);
    }

    public invoke<T extends SystemEventType> (event: T, arg: SystemDefines.InputEventListenerParams<T>): void {
        super.invoke(event, arg);
    }

    public emit<T extends SystemEventType> (event: T, arg: SystemDefines.InputEventListenerParams<T>): void {
        super.emit(event, arg);
    }

    private init () {
        this.addDomEventListener('mousedown', (ev: MouseEvent) => this.emit(SystemEventType.MOUSE_DOWN, ev));
        this.addDomEventListener('mouseup', (ev: MouseEvent) => this.emit(SystemEventType.MOUSE_UP, ev));
        this.addDomEventListener('mousemove', (ev: MouseEvent) => this.emit(SystemEventType.MOUSE_MOVE, ev));
        this.addDomEventListener('wheel', (ev: WheelEvent) => this.emit(SystemEventType.MOUSE_WHEEL, ev));
        this.addDomEventListener('touchstart', (ev: TouchEvent) => this.emit(SystemEventType.TOUCH_START, ev));
        this.addDomEventListener('touchend', (ev: TouchEvent) => this.emit(SystemEventType.TOUCH_END, ev));
        this.addDomEventListener('touchmove', (ev: TouchEvent) => this.emit(SystemEventType.TOUCH_MOVE, ev));
        this.addDomEventListener('touchcancel', (ev: TouchEvent) => this.emit(SystemEventType.TOUCH_CANCEL, ev));
        this.addDomEventListener('keydown', (ev: KeyboardEvent) => this.emit(SystemEventType.KEY_DOWN, ev));
        this.addDomEventListener('keyup', (ev: KeyboardEvent) => this.emit(SystemEventType.KEY_UP, ev));
        this.addDomEventListener('keypress', (ev: KeyboardEvent) => this.emit(SystemEventType.KEY_PRESS, ev));
    }

    private addDomEventListener<K extends keyof HTMLElementEventMap> (type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
        this.dom.addEventListener(type, listener, options);
        this._listenerMap[type] = listener;
    }

    public destroy () {
        for (const eventName in this._listenerMap) {
            if (Object.prototype.hasOwnProperty.call(this._listenerMap, eventName)) {
                const listener = this._listenerMap[eventName];
                //@ts-ignore
                this.dom.removeEventListener(eventName, listener);
            }
        }
    }

}
