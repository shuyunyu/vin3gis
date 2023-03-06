import { Utils } from "../../../core/utils/utils";

export class ManagedArray<T> {

    private _length: number;

    private _array: T[];

    public get length () {
        return this._length;
    }

    public set length (length: number) {
        let array = this._array;
        let originalLength = this._length;
        if (length < originalLength) {
            // Remove trailing references
            for (var i = length; i < originalLength; ++i) {
                //@ts-ignore
                array[i] = undefined;
            }
        } else if (length > array.length) {
            array.length = length;
        }
        this._length = length;
    }

    public get values () {
        return this._array;
    }

    constructor (length?: number) {
        this._length = Utils.defaultValue(length, 0);
        this._array = new Array<T>(this._length);
    }

    public get (index: number) {
        return this._array[index];
    }

    public set (index: number, ele: T) {
        if (index >= this._length) {
            this.length = index + 1;
        }
        this._array[index] = ele;
    }

    public peek () {
        return this._array[this._length - 1];
    }

    public push (ele: T) {
        let index = this.length++;
        this._array[index] = ele;
    }

    public pop () {
        if (this.length === 0) {
            return undefined;
        }
        let element = this._array[this._length - 1];
        --this.length;
        return element;
    }

    public reserve (length: number) {
        if (length > this._array.length) {
            this._array.length = length;
        }
    }

    public resize (length: number) {
        this.length = length;
    }

    public trim (length?: number) {
        length = Utils.defaultValue(length, this._length);
        this._array.length = length!;
    }

}