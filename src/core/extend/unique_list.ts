/**
 * 唯一值队列
 * 此队列和Set的作用很相似，但是也有一些差别
 * 1. 当使用add添加元素的方法时，new Set().add(1)返回的是Set本身，如果需要判断当前元素是否已被添加进Set中，就需要在add之前先使用has判断一下。
 * 使用此队列的话 add方法可以直接告知元素是否添加成功，可以少写一点代码。
 */
export class UniqueList<T>  {

    private _list: T[];

    constructor (originData?: T[]) {
        this._list = [];
        if (originData) originData.forEach(d => this.add(d));
    }

    public add (val: T): boolean {
        if (!this.contain(val)) {
            this._list.push(val);
            return true;
        }
        return false;
    }

    public remove (val: T): boolean {
        let index = this.indexOf(val);
        if (index > -1) {
            this._list.splice(index, 1);
            return true;
        }
        return false;
    }

    public get (index: number) {
        return this._list[index];
    }

    public contain (val: T): boolean {
        return this.indexOf(val) > -1;
    }

    public indexOf (val: T): number {
        return this._list.indexOf(val);
    }

    public forEach (callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        this._list.forEach(callbackfn, thisArg);
    }

    public size (): number {
        return this._list.length;
    }

    public reverse () {
        this._list.reverse();
    }

    public clone () {
        return new UniqueList(this._list);
    }

    public clear () {
        this._list.length = 0;
    }

}