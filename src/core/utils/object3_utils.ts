import { Object3D } from "three";

export class Object3Utils {

    /**
     * 编辑Object3
     * @param object3 
     * @param callbackfn 
     */
    public static foreachObject3 (object3: Object3D, callbackfn: (o: Object3D, index: number) => any | boolean) {
        let stack = [object3];
        let index = 0;
        while (stack.length) {
            const o = stack.shift();
            const shouldBreak = callbackfn(o, index) === false;
            if (shouldBreak) break;
            if (o.children && o.children.length) {
                stack = stack.concat(o.children);
            }
        }
    }

}