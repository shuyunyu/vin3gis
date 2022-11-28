/**
 * 定义对象池
 */
export interface IPool<T, P> {
    readonly name: string;
    readonly maxPoolSize: number;//池大小
    create: (p: P) => T;//从池子里面创建对象
    recycle: (o: T) => void;//回收对象
}

export class BasePool<T, P> implements IPool<T, P> {

    protected _list: T[] = [];

    public name: string;

    public maxPoolSize: number;

    public constructor (name: string, maxPoolSize: number = 100) {
        this.name = name;
        this.maxPoolSize = maxPoolSize;
    }

    public create (p: P) {
        return null;
    }

    public recycle (o: T) {

    }

}