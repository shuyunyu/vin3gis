import { RTS } from "../../@types/global/global";

export class Utils {

    public static defaultValue<T> (a: T, b: T) {
        return this.defined(a) ? a : b;
    }

    public static defined (val: any) {
        return val !== undefined && val !== null;
    }

    public static createGuid () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            let r = (Math.random() * 16) | 0;
            let v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * 比较两个rts是否相等
     * @param left 
     * @param right 
     * @returns 
     */
    public static equalsRTS (left: RTS, right: RTS) {
        return left.position.equals(right.position) && left.rotation.equals(right.rotation!) && left.scale.equals(right.scale);
    }

}