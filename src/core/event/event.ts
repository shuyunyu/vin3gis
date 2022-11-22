import { EventType, Listener } from "../../@types/core/event/event"
import { Utils } from "../utils/utils";

type EventListener = {
    listener: Listener;
    context?: any;
    once: boolean;
}

export class Event {

    private _listenerRecord: Record<string, EventListener[]> = Object.create(null);

    public constructor () { }

    /**
     * 判断该事件上是否已经添加了某个监听
     * @param event
     * @param listener 
     * @param context
     */
    private hasListener (event: EventType, listener: Listener, context?: any) {
        const listeners = this._listenerRecord[event];
        if (!listeners) {
            //create listner array
            this._listenerRecord[event] = [];
            return false;
        }
        return this.findLinsterIndex(listeners, listener, context);
    }

    /**
     * 查找listener的索引
     * @param event
     * @param listener 
     * @param context 
     * @returns 
     */
    private findLinsterIndex (listeners: EventListener[], listener: Listener, context?: any) {
        return listeners.findIndex(l => l.listener === listener && (Utils.defined(context) ? l.context === context : true));
    }

    /**
     * 添加事件监听
     * @param event
     * @param listener 
     * @param context 
     */
    public addEventListener (event: EventType, listener: Listener, context?: any) {
        if (!this.hasListener(event, listener, context)) this._listenerRecord[event].push({ listener: listener, context: context, once: false });
    }

    /**
     * 移除事件监听
     * @param event
     * @param listener 
     * @param context
     */
    public removeEventListener (event: EventType, listener: Listener, context?: any) {
        const listeners = this._listenerRecord[event];
        if (!listeners) return;
        const index = this.findLinsterIndex(listeners, listener, context);
        if (index > -1) listeners.splice(index, 1);
    }

    /**
     * 派发事件
     * @param event 
     * @param args 
     */
    public dispatchEvent (event: EventType, ...args: any) {
        const listeners = this._listenerRecord[event];
        if (listeners) listeners.forEach(l => l.listener.apply(l.context, args));
    }

}