import { Constructor } from "../../../@types/global/global";
import { BaseWorker } from "../base_worker";

export class WorkerPool<T extends BaseWorker> {

    private _ctor: Constructor<T>;

    public readonly poolSize: number;

    private _pool: T[];

    public constructor (ctor: Constructor<T>, poolSize: number) {
        this._ctor = ctor;
        this.poolSize = poolSize;
        this._pool = new Array(this.poolSize).fill(null);
    }

    public getInstance () {
        const index = Math.floor(Math.random() * this.poolSize);
        let ins = this._pool[index];
        if (!ins) {
            let args = [];
            for (let i = 0; i < arguments.length; i++) {
                const arg = arguments[i];
                args.push(arg);
            }
            ins = this._pool[index] = new this._ctor(...args);
        }
        return ins;
    }

    public disposeInstance (instance: T) {
        const index = this._pool.indexOf(instance);
        if (index > -1) {
            this._pool.splice(index, 1);
        }
        instance.dispose();
    }

}