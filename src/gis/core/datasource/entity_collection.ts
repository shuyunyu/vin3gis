import { Collection } from "../misc/collection";
import { Entity } from "./entity";

export class EntityCollection extends Collection<Entity> {

    //标识 事件是否挂起
    private _suspended: boolean = false;

    public constructor (entities?: Entity[]) {
        super(entities);
    }

}