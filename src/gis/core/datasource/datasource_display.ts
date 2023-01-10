import { Object3D } from "three";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { Entity } from "./entity";
import { EntityCollection, EntityCollectionChangedData } from "./entity_collection";
import { BaseGeometry } from "./geometry/base_geometry";

/**
 * 负责各种数据源的数据之显示
 */
export class DataSourceDisplay {

    //挂载实体对象的节点
    public readonly root = new Object3D();

    private _entities: EntityCollection;

    private _tilingScheme: ITilingScheme

    public constructor (entityCollection: EntityCollection, tilingScheme: ITilingScheme) {
        this._entities = entityCollection;
        this._entities.collectionChangedEvent.addEventListener(this.onEntityCollectionChanged, this);
        this._tilingScheme = tilingScheme;
    }

    /**
     * 实体集合改变事件监听
     * @param data 
     */
    private onEntityCollectionChanged (data: EntityCollectionChangedData) {
        const showEntities: Entity[] = [];
        const removeEntities: Entity[] = data.removed;
        const hideEntities: Entity[] = [];
        for (let i = 0; i < data.added.length; i++) {
            const entity = data.added[i];
            if (entity.visible) {
                showEntities.push(entity);
            }
        }
        for (let i = 0; i < data.changed.length; i++) {
            const entity = data.changed[i];
            if (entity.visible) {
                showEntities.push(entity);
            } else {
                hideEntities.push(entity);
            }
        }
        this.entityDisplayControl(showEntities, "show");
        this.entityDisplayControl(hideEntities, "hide");
        this.entityDisplayControl(removeEntities, "remove");
    }

    /**
     * Entity显示控制
     * @param entities 
     * @param ctrl 
     */
    private entityDisplayControl (entities: Entity[], ctrl: "show" | "remove" | "hide") {
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            for (const propKey in entity) {
                if (Object.prototype.hasOwnProperty.call(entity, propKey)) {
                    const propVal = entity[propKey];
                    if (propVal && propVal instanceof BaseGeometry) {
                        if (ctrl === "show") {
                            propVal.visualizer.show(entity, this._tilingScheme, this.root);
                        } else if (ctrl === "remove") {
                            propVal.visualizer.remove(entity, this.root);
                        } else if (ctrl === "hide") {
                            propVal.visualizer.hide(entity, this.root);
                        }
                    }
                }
            }
        }
    }

    public lateUpdate (deltaTime: number) {

    }

}