import { GenericEvent } from "../../../core/event/generic_event";
import { Utils } from "../../../core/utils/utils";

/**
 * 集合基类
 */
export class Collection<T> {

    protected _collection: T[] = [];

    //向集合中新增元素时触发
    public readonly eleAdded = new GenericEvent<T>();

    //集合中元素移动时触发
    public readonly eleMoved = new GenericEvent<T>();

    //从集合中移除元素时触发
    public readonly eleRemoved = new GenericEvent<T>();

    public get size () {
        return this._collection.length;
    }

    public constructor (list?: T[]) {
        if (Utils.defined(list)) {
            list.forEach(item => this.add(item));
        }
    }

    /**
     * 向集合中添加元素
     * @param item 
     * @param index 指定索引
     * @returns 元素是否被添加进集合中
     */
    public add (item: T, index?: number) {
        if (!this.contains(item)) {
            if (Utils.defined(index) && index >= 0 && index < this._collection.length) {
                this._collection.splice(index, 0, item);
            } else {
                this._collection.push(item);
            }
            this.eleAdded.emit(item);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 将元素放置集合最底部
     * @param item 
     */
    public lowerToBottom (item: T) {
        let index = this.indexOf(item);
        if (index > -1) {
            this._collection.splice(index, 1);
            this._collection.unshift(item);
        } else {
            this._collection.unshift(item);
        }
        this.eleMoved.emit(item);
    }

    /**
     * 将元素放置集合最上面
     * @param item 
     */
    public raiseToTop (item: T) {
        let index = this.indexOf(item);
        if (index > -1) {
            this._collection.splice(index, 1);
            this._collection.push(item);
        } else {
            this._collection.push(item);
        }
        this.eleMoved.emit(item);
    }

    /**
     * 从集合中移除元素
     * @param item 
     * @returns 
     */
    public remove (item: T) {
        let index = this.indexOf(item);
        if (index > -1) {
            this._collection.splice(index, 1);
            this.eleRemoved.emit(item);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 移除所有元素
     */
    public removeAll () {
        const eles = [].concat(this._collection) as T[];
        this._collection.length = 0;
        eles.forEach(ele => {
            this.eleRemoved.emit(ele);
        });
    }

    public contains (item: T) {
        return this.indexOf(item) > -1;
    }

    public indexOf (item: T) {
        return this._collection.indexOf(item);
    }

    public get (index: number): T | undefined {
        return this._collection[index];
    }

    /**
     * 遍历集合中的元素
     * @param callback 
     */
    public foreach (callback: (item: T, index: number) => any) {
        for (let i = 0; i < this._collection.length; i++) {
            const element = this._collection[i];
            const res = callback(element, i);
            if (res === false) break;
        }
    }

    public toArray (out?: T[]) {
        out = out || [];
        out.length = 0;
        out.push(...this._collection);
        return out;
    }

}