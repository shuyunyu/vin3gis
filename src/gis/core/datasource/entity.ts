import { GenericEvent } from "../../../core/event/generic_event";
import { Utils } from "../../../core/utils/utils";

export class Entity {

    public readonly id: string;

    //定义改变事件
    public readonly definitionChangedEvent: GenericEvent<Entity>;

    public constructor () {
        this.id = Utils.createGuid();
        this.definitionChangedEvent = new GenericEvent();
    }

}