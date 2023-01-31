import { PerspectiveCamera } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { EarthCamera } from "../camera/earth_camera";
import { DataSourceDisplay } from "../datasource/datasource_display";
import { EntityCollection } from "../datasource/entity_collection";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { TileNodeRenderer } from "../renderer/tile_node_renderer";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { FrameState } from "./frame_state";
import { GlobeSurfaceTileManager } from "./globe_surface_tile_manager";
import { QuadtreePrimitive } from "./quad_tree_primitive";

export class EarthScene {

    public readonly ready: boolean = false;

    public readonly camera: EarthCamera;

    private _renderer: FrameRenderer;

    public readonly globleSurfaceManager: GlobeSurfaceTileManager;

    public readonly imageryProviders: ImageryTileProviderCollection;

    public readonly entities: EntityCollection;

    public readonly tilingScheme: ITilingScheme;

    public readonly quadtreePrimitive: QuadtreePrimitive;

    public readonly lateUpdateEvent = new GenericEvent<number>;

    //瓦片节点渲染器
    public readonly tileNodeRenderer: TileNodeRenderer;

    public readonly dataSourceDisplay: DataSourceDisplay;

    constructor (renderer: FrameRenderer, imageryTileProvider: IImageryTileProvider, terrainProvider: ITerrainProvider, tileCacheSize: number) {
        this._renderer = renderer;
        this.tileNodeRenderer = new TileNodeRenderer();
        //将渲染根节点添加到场景中
        this._renderer.scene.add(this.tileNodeRenderer.root);
        this.imageryProviders = new ImageryTileProviderCollection();
        this.imageryProviders.add(imageryTileProvider);
        this.entities = new EntityCollection();
        this.quadtreePrimitive = new QuadtreePrimitive(this.imageryProviders.get(0)!, tileCacheSize);
        this.tilingScheme = this.quadtreePrimitive.tileProvider.tilingScheme;
        this.camera = new EarthCamera(this._renderer, this.tilingScheme);
        this.globleSurfaceManager = new GlobeSurfaceTileManager(this.quadtreePrimitive, terrainProvider, this);
        this.dataSourceDisplay = new DataSourceDisplay(this.entities, this.tilingScheme, renderer);
        //将DataSource的渲染根节点添加到场景中
        this._renderer.scene.add(this.dataSourceDisplay.root);
        this.ready = true;
    }


    //设置最底下的瓦片提供者
    public setBaseImageryTileProvider (provider: IImageryTileProvider, oldProvider: IImageryTileProvider) {
        this.imageryProviders.remove(oldProvider);
        provider.visible = true;
        this.imageryProviders.lowerToBottom(provider);
        this.quadtreePrimitive.tileProvider = provider;
    }

    public postRender (delay: number) {
        if (!this.ready) return;
        let frameState = new FrameState(this._renderer.camera as PerspectiveCamera, this._renderer.size);
        this.globleSurfaceManager.render(delay, frameState);
        this.camera.postRender(delay, frameState);
        frameState.endFrame();
    }

    public renderLateUpdate (delay: number) {
        this.dataSourceDisplay.lateUpdate(delay);
        this.lateUpdateEvent.invoke(delay);
    }


    public destroy () {
    }

}