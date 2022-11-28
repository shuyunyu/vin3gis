import { EventType, Listener } from "../../@types/core/event/event"
import { Utils } from "../utils/utils";

type EventListener = {
    listener: Listener;
    context?: any;
    once: boolean;
}

export class Event {

    private _listenerRecord: Record<string, EventListener[]> = Object.create(null);

    private _toRemoveListeners: { event: EventType, listener: EventListener }[] = [];

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
        return this.findLinsterIndex(listeners, listener, context) > -1;
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
     * 添加只监听一次的事件监听
     * @param event 
     * @param listener 
     * @param context 
     */
    public once (event: EventType, listener: Listener, context?: any) {
        if (!this.hasListener(event, listener, context)) this._listenerRecord[event].push({ listener: listener, context: context, once: true });
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
        let listeners = this._listenerRecord[event];
        if (listeners && listeners.length) {
            //复制一份 防止remove之后导致遍历数组变化
            listeners = listeners.slice(0);
            listeners.forEach(l => {
                l.listener.apply(l.context, args);
                if (l.once) this._toRemoveListeners.push({ event: event, listener: l });
            });
            if (this._toRemoveListeners.length) {
                //移除只监听一次的事件
                while (this._toRemoveListeners.length) {
                    const tr = this._toRemoveListeners.shift();
                    this.removeEventListener(tr.event, tr.listener.listener, tr.listener.context);
                }
            }
        }
    }

    /**
     * 绑定事件监听 
     * 同 addEventListener
     * @param event 
     * @param listener 
     * @param context 
     */
    public on (event: EventType, listener: Listener, context?: any) {
        this.addEventListener(event, listener, context);
    }

    /**
     * 解绑事件监听
     * 同 removeEventListener
     * @param event 
     * @param listener 
     * @param context 
     */
    public off (event: EventType, listener: Listener, context?: any) {
        this.removeEventListener(event, listener, context);
    }

    /**
     * 派发事件
     * 同dispatchEvent
     * @param event 
     * @param args 
     */
    public invoke (event: EventType, ...args: any) {
        this.dispatchEvent.call(this, arguments);
    }

    /**
     * 派发事件
     * 同dispatchEvent
     * @param event 
     * @param args 
     */
    public emit (event: EventType, ...args: any) {
        this.dispatchEvent.call(this, args);
    }

}