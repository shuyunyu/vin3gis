import { EntityCollection } from "./entity_collection";

/**
 * 负责各种数据源的数据之显示
 */
export class DataSourceDisplay {

    private _entities: EntityCollection;

    public constructor (entityCollection: EntityCollection) {
        this._entities = entityCollection;
    }

    public lateUpdate (deltaTime: number) {

    }

}