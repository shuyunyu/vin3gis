import { GenericEvent } from "../../../core/event/generic_event";
import { UniqueList } from "../../../core/extend/unique_list";
import { Utils } from "../../../core/utils/utils";
import { EntityOptions } from "../../@types/core/gis";
import { BaseGeometry } from "./geometry/base_geometry";
import { BillboardGeometry } from "./geometry/billboard_geometry";
import { MultiPointGeometry } from "./geometry/multi_point_geometry";
import { PointCloudGeometry } from "./geometry/point_cloud_geometry";
import { PointGeometry } from "./geometry/point_geometry";

export class Entity {

    public readonly id: string;

    //可见性改变事件
    public readonly visibleChangedEvent: GenericEvent<Entity>;

    //定义geometry改变事件
    public readonly geometryChangedEvent: GenericEvent<Entity>;

    //保存所有需要重新渲染的geometry
    public readonly needRerenderGeometryList: UniqueList<BaseGeometry>;

    //保存所有需要更新渲染的geometry
    public readonly needUpdateGeometryList: UniqueList<BaseGeometry>;

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

    private _multiPoint?: MultiPointGeometry;

    public get multiPoint () {
        return this._multiPoint;
    }

    private _pointCloud?: PointCloudGeometry;

    public get pointClound () {
        return this._pointCloud;
    }

    private _billboard?: BillboardGeometry;

    public get billboard () {
        return this._billboard;
    }

    public constructor (options: EntityOptions) {
        this.id = Utils.createGuid();
        this.visibleChangedEvent = new GenericEvent();
        this.geometryChangedEvent = new GenericEvent();
        this.needRerenderGeometryList = new UniqueList();
        this.needUpdateGeometryList = new UniqueList();
        this._visible = Utils.defaultValue(options.visible, true);
        if (options.point) {
            this._point = options.point;
            this._point.entity = this;
        }
        if (options.multiPoint) {
            this._multiPoint = options.multiPoint;
            this._multiPoint.entity = this;
        }
        if (options.pointCloud) {
            this._pointCloud = options.pointCloud;
            this._pointCloud.entity = this;
        }
        if (options.billboard) {
            this._billboard = options.billboard;
            this._billboard.entity = this;
        }
    }

    /**
     * 重新渲染geometry
     * - 触发geometry的重新渲染
     * @param geometry 
     */
    public rendererGeometry (geometry: BaseGeometry) {
        if (geometry.entity === this) {
            this.needRerenderGeometryList.add(geometry);
            this.geometryChangedEvent.emit(this);
        }
    }

    /**
     * 更新geometry
     * - 触发geometry的渲染更新
     * @param geometry 
     */
    public updateGeometry (geometry: BaseGeometry) {
        if (geometry.entity === this) {
            this.needUpdateGeometryList.add(geometry);
            this.geometryChangedEvent.emit(this);
        }
    }

}