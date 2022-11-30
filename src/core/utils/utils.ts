import { RTS } from "../../@types/global/global";

export class Utils {

    public static defaultValue<T> (a: T, b: T) {
        return this.defined(a) ? a : b;
    }

    public static defined (val: any) {
        return val !== undefined && val !== null;
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