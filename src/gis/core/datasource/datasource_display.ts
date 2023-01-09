import { EntityCollection, EntityCollectionChangedData } from "./entity_collection";

/**
 * 负责各种数据源的数据之显示
 */
export class DataSourceDisplay {

    private _entities: EntityCollection;

    public constructor (entityCollection: EntityCollection) {
        this._entities = entityCollection;
        this._entities.collectionChangedEvent.addEventListener(this.onEntityCollectionChanged, this);
    }

    /**
     * 实体集合改变事件监听
     * @param data 
     */
    private onEntityCollectionChanged (data: EntityCollectionChangedData) {

    }

    public lateUpdate (deltaTime: number) {

    }

}