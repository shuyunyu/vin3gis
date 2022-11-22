export class Utils {

    public static defaultValue<T> (a: T, b: T) {
        return this.defined(a) ? a : b;
    }

    public static defined (val: any) {
        return val !== undefined && val !== null;
    }

}