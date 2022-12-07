import { Constructor } from "../../../@types/global/global";

/**
 * 定义对象池
 */
export interface IPool<T, P> {
    readonly type: Constructor<T>;//对象池类型
    readonly maxPoolSize: number;//池大小
    create: (p?: P) => T;//从池子里面创建对象
    recycle: (o: T) => void;//回收对象
}

/**
 * 基础对象池
 */
export class BasePool<T, P> implements IPool<T, P> {

    protected _list: T[] = [];

    public readonly type: Constructor<T>;

    public maxPoolSize: number;

    public constructor (ctor: Constructor<T>, maxPoolSize: number = 100) {
        this.type = ctor;
        this.maxPoolSize = maxPoolSize;
    }

    /**
     * 通过参数构建对象
     * @param p 
     * @returns 
     */
    public create (p?: P) {
        if (this._list.length) {
            const t = this.onSelect(p);
            this.onUpdate(t, p);
            return t;
        } else {
            return this.onConstructor(p);
        }
    }

    /**
     * 回收对象
     * @param o 
     */
    public recycle (o: T) {
        this.onRecycle(o);
        if (this._list.length < this.maxPoolSize) {
            this._list.push(o);
        } else {
            this.onAbandon(o);
        }
    }

    /**
     * 通过参数构建对象
     * 子类需重写此方法
     * @param p 
     */
    protected onConstructor (p?: P): T {
        return null;
    }

    /**
     * 通过参数从池中选择对象 
     * 子类可以重写此方法来修改从池中获取对象的方法
     * @param p 
     * @returns 
     */
    protected onSelect (p?: P): T {
        return this._list.shift();
    }

    /**
     * 通过参数更新对象
     * 子类需重写此方法
     * @param o 
     * @param p 
     */
    protected onUpdate (o: T, p?: P) {

    }

    /**
     * 回收对象
     * @param o 
     */
    protected onRecycle (o: T) {

    }

    /**
     * 丢弃对象，不进池子
     * @param o 
     */
    protected onAbandon (o: T) {

    }

}