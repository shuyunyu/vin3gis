import { Group, Object3D } from "three";
import { Collection } from "../misc/collection";
import { IPrimitive } from "./primitive";

/**
 * 基元集合
 */
export class PrimitiveCollection extends Collection<IPrimitive> {

    public readonly root: Object3D;

    public constructor () {
        super();
        this.root = new Group();
        this.root.name = `${PrimitiveCollection.name}_root`;
    }

    public add (item: IPrimitive, index?: number): boolean {
        const res = super.add(item, index);
        if (res && item.container) {
            this.root.add(item.container);
        }
        return res;
    }

    public remove (item: IPrimitive): boolean {
        const res = super.remove(item);
        if (item.container) this.root.remove(item.container)
        return res;
    }

    public removeAll (): void {
        const eles = [].concat(this._collection) as IPrimitive[];
        eles.forEach(item => {
            if (item.container) this.root.remove(item.container);
        })
        return super.removeAll();
    }

}