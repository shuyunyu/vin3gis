import { Object3D } from "three";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { EntityGeometryRenderDriver } from "../../@types/core/gis";
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

    private _renderer: FrameRenderer;

    public constructor (entityCollection: EntityCollection, tilingScheme: ITilingScheme, renderer: FrameRenderer) {
        this._entities = entityCollection;
        this._entities.collectionChangedEvent.addEventListener(this.onEntityCollectionChanged, this);
        this._tilingScheme = tilingScheme;
        this._renderer = renderer;
        this._renderer.resizeEvent.addEventListener(this.onRendererReisze, this);
    }

    /**
     * 实体集合改变事件监听
     * @param data 
     */
    private onEntityCollectionChanged (data: EntityCollectionChangedData) {
        const showEntities: Entity[] = [];
        const removeEntities: Entity[] = data.removed;
        const hideEntities: Entity[] = [];
        const updateEntities: Entity[] = data.changed;
        for (let i = 0; i < data.added.length; i++) {
            const entity = data.added[i];
            if (entity.visible) {
                showEntities.push(entity);
            }
        }
        for (let i = 0; i < data.visibleChanged.length; i++) {
            const entity = data.visibleChanged[i];
            if (entity.visible) {
                showEntities.push(entity);
            } else {
                hideEntities.push(entity);
            }
        }
        this.entityDisplayControl(showEntities, "show");
        this.entityDisplayControl(hideEntities, "hide");
        this.entityDisplayControl(removeEntities, "remove");
        this.entityDisplayControl(updateEntities, "update");
    }

    /**
     * Entity显示控制
     * @param entities 
     * @param ctrl 
     */
    private entityDisplayControl (entities: Entity[], ctrl: "show" | "remove" | "hide" | "update" | "resize") {
        if (ctrl !== "update") {
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                for (const propKey in entity) {
                    if (Object.prototype.hasOwnProperty.call(entity, propKey)) {
                        const propVal = entity[propKey];
                        if (propVal && propVal instanceof BaseGeometry) {
                            if (ctrl === "show") {
                                propVal.visualizer.show(entity, this._tilingScheme, this.root, this._renderer);
                            } else if (ctrl === "remove") {
                                propVal.visualizer.remove(entity, this.root);
                            } else if (ctrl === "hide") {
                                propVal.visualizer.hide(entity, this.root);
                            } else if (ctrl === "resize") {
                                propVal.visualizer.onRendererSize(entity, this._tilingScheme, this.root, this._renderer);
                            }
                        }
                    }
                }
            }
        } else {
            //update geometry
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                //rerender
                entity.needRerenderGeometryList.forEach((geometryDriver: EntityGeometryRenderDriver) => {
                    geometryDriver.geometry.visualizer.rerender(entity, this._tilingScheme, this.root, this._renderer, geometryDriver.property);
                });
                entity.needRerenderGeometryList.clear();
                //update
                entity.needUpdateGeometryList.forEach((geometryDriver: EntityGeometryRenderDriver) => {
                    geometryDriver.geometry.visualizer.update(entity, this._tilingScheme, this.root, this._renderer, geometryDriver.property);
                });
                entity.needUpdateGeometryList.clear();
            }
        }
    }

    /**
     * 监听renderer的resize事件
     * @param renderer 
     * @returns 
     */
    private onRendererReisze (renderer: FrameRenderer) {
        if (renderer !== this._renderer) return;
        this.entityDisplayControl(this._entities.toArray(), 'resize');
    }

    public lateUpdate (deltaTime: number) {

    }

}