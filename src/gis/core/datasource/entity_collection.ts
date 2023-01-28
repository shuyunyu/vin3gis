import { GenericEvent } from "../../../core/event/generic_event";
import { Collection } from "../misc/collection";
import { Entity } from "./entity";

export type EntityCollectionChangedData = {
    collection: Entity[];
    added: Entity[];
    removed: Entity[];
    changed: Entity[];
    visibleChanged: Entity[];
}

export class EntityCollection extends Collection<Entity> {

    private _added: Entity[] = [];

    private _removed: Entity[] = [];

    private _changed: Entity[] = [];

    private _visibleChanged: Entity[] = [];

    //标识 事件是否挂起
    private _suspended: boolean = false;

    //集合改变事件
    public readonly collectionChangedEvent: GenericEvent<EntityCollectionChangedData>;

    public constructor (entities?: Entity[]) {
        super(entities);
        this.collectionChangedEvent = new GenericEvent();
    }

    public add (item: Entity, index?: number): boolean {
        const res = super.add(item, index);
        if (res) {
            this.entityEnqueue(this._added, item);
            item.definitionChangedEvent.addEventListener(this.onEntityDefinitionChanged, this);
            item.visibleChangedEvent.addEventListener(this.onEntityVisibleChanged, this);
            this.invokeEvent();
        }
        return res;
    }

    public remove (item: Entity): boolean {
        const res = super.remove(item);
        if (res) {
            this.entityEnqueue(this._removed, item);
            item.definitionChangedEvent.removeEventListener(this.onEntityDefinitionChanged, this);
            item.visibleChangedEvent.removeEventListener(this.onEntityVisibleChanged, this);
            this.invokeEvent();
        }
        return res;
    }

    /**
     * 根据id移除实体
     * @param id 
     * @returns 
     */
    public removeById (id: string) {
        const index = this.indexOfId(id);
        if (index > -1) {
            this.remove(this._collection[index]);
            return true;
        }
        return false;
    }

    public removeAll (): void {
        const entities = [].concat(this._collection) as Entity[];
        super.removeAll();
        entities.forEach(entity => {
            this.entityEnqueue(this._removed, entity);
            entity.definitionChangedEvent.removeEventListener(this.onEntityDefinitionChanged, this);
            entity.visibleChangedEvent.removeEventListener(this.onEntityVisibleChanged, this);
        });
        if (entities.length) {
            this.invokeEvent();
        }
    }

    private indexOfId (id: string) {
        return this._collection.findIndex(item => item.id === id);
    }

    /**
     * 根据id查找Entity
     * @param id 
     * @returns 
     */
    public getById (id: string): Entity | undefined {
        const index = this.indexOfId(id);
        return index > -1 ? this._collection[index] : undefined;
    }

    /**
     * 挂起当前事件
     */
    public suspendEvents () {
        this._suspended = true;
    }

    /**
     * 重启当前事件
     */
    public resumeEvents () {
        this._suspended = false;
        this.invokeEvent();
    }

    /**
     * 实体入队
     * @param queue 
     * @param entity 
     */
    private entityEnqueue (queue: Entity[], entity: Entity) {
        let index = -1;
        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            if (item.id === entity.id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            queue.push(entity);
        }
    }

    /**
     * 清空实体队列
     * @param queue 
     */
    private clearEntityQueue (queue: Entity[]) {
        queue.length = 0;
    }

    /**
     * 触发事件
     */
    public invokeEvent () {
        if (!this._suspended && (this._added.length || this._removed.length || this._changed.length || this._visibleChanged.length)) {
            this.collectionChangedEvent.invoke({
                collection: this._collection,
                added: this._added,
                removed: this._removed,
                changed: this._changed,
                visibleChanged: this._visibleChanged
            });
            this.clearEntityQueue(this._added);
            this.clearEntityQueue(this._removed);
            this.clearEntityQueue(this._changed);
            this.clearEntityQueue(this._visibleChanged);
        }
    }

    /**
     * 实体定义改变监听
     * @param entity 
     */
    private onEntityDefinitionChanged (entity: Entity) {
        this.entityEnqueue(this._changed, entity);
        this.invokeEvent();
    }

    /**
     * 实体可见性改变监听
     * @param entity 
     */
    private onEntityVisibleChanged (entity: Entity) {
        this.entityEnqueue(this._visibleChanged, entity);
        this.invokeEvent();
    }

}