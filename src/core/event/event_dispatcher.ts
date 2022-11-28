
/**
 * ListenerEvent designates the format of data sent by EventDispatcher
 *
 * target: source of emitter, set upon dispatch
 * type: 'name' of the event
 * message: any content you want to pass
 */
interface ListenerEvent {
    target?: EventDispatcher;
    type: string;
    message: any;
}

/**
 * Callback function to process event when EventDispatcher receives one
 */
type ListenerEventLambda = ((event: ListenerEvent) => any);

/**
 * @author mrdoob / http://mrdoob.com/
 */
class EventDispatcher {

    public _listeners?: Record<string, ListenerEventLambda[]>;

    addEventListener (type: string, listener: ListenerEventLambda) {

        if (this._listeners === undefined) this._listeners = Object.create(null);

        const listeners = this._listeners;

        if (listeners[type] === undefined) {

            listeners[type] = [];

        }

        if (listeners[type].indexOf(listener) === - 1) {

            listeners[type].push(listener);

        }

    }

    hasEventListener (type: string, listener: ListenerEventLambda) {

        if (this._listeners === undefined) return false;

        const listeners = this._listeners;

        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1;

    }

    removeEventListener (type: string, listener: ListenerEventLambda) {

        if (this._listeners === undefined) return;

        const listeners = this._listeners;
        const listenerArray = listeners[type];

        if (listenerArray !== undefined) {

            const index = listenerArray.indexOf(listener);

            if (index !== - 1) {

                listenerArray.splice(index, 1);

            }

        }

    }

    dispatchEvent (event: ListenerEvent) {

        if (this._listeners === undefined) return;

        const listeners = this._listeners;
        const listenerArray = listeners[event.type];

        if (listenerArray !== undefined) {

            event.target = this;

            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice(0);

            for (let i = 0, l = array.length; i < l; i++) {

                array[i].call(this, event);

            }

        }

    }

}

export { EventDispatcher };