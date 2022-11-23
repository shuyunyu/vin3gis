import { EventType } from "../../@types/core/event/event";
import { Event } from "./event";

/**
 * 范型事件
 */
export class GenericEvent<T> extends Event {

    private static _genericEventCount: number = 0;

    private _eventType: EventType;

    public constructor () {
        super();
        this._eventType = "__generic_event_" + GenericEvent._genericEventCount++;
    }

    //@ts-ignore
    public addEventListener (listener: (arg: T) => void, context?: any): void {
        super.addEventListener(this._eventType, listener, context);
    }

    //@ts-ignore
    public removeEventListener (listener: (arg: T) => void, context?: any): void {
        super.removeEventListener(this._eventType, listener, context);
    }

    //@ts-ignore
    public once (listener: (arg: T) => void, context?: any): void {
        super.once(this._eventType, listener, context);
    }

    //@ts-ignore
    public on (listener: (arg: T) => void, context?: any): void {
        super.on(this._eventType, listener, context);
    }

    //@ts-ignore
    public off (listener: (arg: T) => void, context?: any): void {
        super.off(this._eventType, listener, context);
    }

    //@ts-ignore
    public dispatchEvent (arg: T): void {
        super.dispatchEvent(this._eventType, arg);
    }

    //@ts-ignore
    public invoke (arg: T): void {
        super.invoke(this._eventType, arg);
    }

}