import { GenericEvent } from "../../../core/event/generic_event";
import { UniqueList } from "../../../core/extend/unique_list";
import { Utils } from "../../../core/utils/utils";
import { EntityOptions } from "../../@types/core/gis";
import { BaseGeometry } from "./geometry/base_geometry";
import { PointGeometry } from "./geometry/point_geometry";

export class Entity {

    public readonly id: string;

    //可见性改变事件
    public readonly visibleChangedEvent: GenericEvent<Entity>;

    //定义geometry改变事件
    public readonly geometryChangedEvent: GenericEvent<Entity>;

    //保存所有修改了的geometry
    public readonly changedGeometryList: UniqueList<BaseGeometry>;

    //可见性
    private _visible: boolean = true;

    public get visible () {
        return this._visible;
    }

    public set visible (val: boolean) {
        if (val !== this._visible) {
            this._visible = val;
            this.visibleChangedEvent.emit(this);
        }
    }

    private _point?: PointGeometry;

    public get point () {
        return this._point;
    }

    public constructor (options: EntityOptions) {
        this.id = Utils.createGuid();
        this.visibleChangedEvent = new GenericEvent();
        this.geometryChangedEvent = new GenericEvent();
        this._visible = Utils.defaultValue(options.visible, true);
        if (options.point) {
            this._point = options.point;
            this._point.entity = this;
        }
    }

    /**
     * 更新geometry
     * - 触发geomtry的渲染更新
     * @param geometry 
     */
    public updateGeometry (geometry: BaseGeometry) {
        if (geometry.entity === this) {
            this.changedGeometryList.add(geometry);
            this.geometryChangedEvent.emit(this);
        }
    }

}