import { GenericEvent } from "../../../core/event/generic_event";
import { Utils } from "../../../core/utils/utils";
import { EntityOptions } from "../../@types/core/gis";
import { PointGeometry } from "./geometry/point_geometry";

export class Entity {

    public readonly id: string;

    //定义改变事件
    public readonly definitionChangedEvent: GenericEvent<Entity>;

    private _point?: PointGeometry;

    public constructor (options: EntityOptions) {
        this.id = Utils.createGuid();
        this.definitionChangedEvent = new GenericEvent();
        if (options.point) {
            this._point = options.point;
            this._point.entity = this;
        }
    }

}