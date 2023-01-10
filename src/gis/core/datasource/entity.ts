import { GenericEvent } from "../../../core/event/generic_event";
import { Utils } from "../../../core/utils/utils";
import { EntityOptions } from "../../@types/core/gis";
import { PointGeometry } from "./geometry/point_geometry";

export class Entity {

    public readonly id: string;

    //定义改变事件
    public readonly definitionChangedEvent: GenericEvent<Entity>;

    //可见性
    private _visible: boolean = true;

    public get visible () {
        return this._visible;
    }

    public set visible (val: boolean) {
        if (val !== this._visible) {
            this._visible = val;
            this.definitionChangedEvent.emit(this);
        }
    }

    private _point?: PointGeometry;

    public constructor (options: EntityOptions) {
        this.id = Utils.createGuid();
        this.definitionChangedEvent = new GenericEvent();
        this._visible = Utils.defaultValue(options.visible, true);
        if (options.point) {
            this._point = options.point;
            this._point.entity = this;
        }
    }

}