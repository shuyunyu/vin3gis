import { AmbientLight, Color, DirectionalLight, PerspectiveCamera, Vector3 } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { EarthCamera } from "../camera/earth_camera";
import { DataSourceDisplay } from "../datasource/datasource_display";
import { EntityCollection } from "../datasource/entity_collection";
import { InternalConfig } from "../internal/internal_config";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { TileNodeRenderer } from "../renderer/tile_node_renderer";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { Transform } from "../transform/transform";
import { Fog } from "./fog";
import { FrameState } from "./frame_state";
import { GlobeSurfaceTileManager } from "./globe_surface_tile_manager";
import { PrimitiveCollection } from "./primitive_collection";
import { QuadtreePrimitive } from "./quad_tree_primitive";
import { Picking } from "./picking";
import { ICartesian2Like } from "../../@types/core/gis";

export class EarthScene {

    public readonly ready: boolean = false;

    public readonly camera: EarthCamera;

    private _renderer: FrameRenderer;

    public readonly globleSurfaceManager: GlobeSurfaceTileManager;

    public readonly imageryProviders: ImageryTileProviderCollection;

    public readonly entities: EntityCollection;

    public readonly primitives: PrimitiveCollection;

    public readonly tilingScheme: ITilingScheme;

    public readonly quadtreePrimitive: QuadtreePrimitive;

    public readonly lateUpdateEvent = new GenericEvent<number>;

    private _picking: Picking;

    //瓦片节点渲染器
    public readonly tileNodeRenderer: TileNodeRenderer;

    public readonly dataSourceDisplay: DataSourceDisplay;

    private _ambientLight: AmbientLight = new AmbientLight("#ebebeb");

    //环境光
    public get ambientLight () {
        return this._ambientLight;
    }

    public set ambientLight (val: AmbientLight) {
        this._ambientLight.copy(val);
    }

    private _sunLight: DirectionalLight = new DirectionalLight("#FFFFFF");

    //太阳光
    public get sunLight () {
        return this._sunLight;
    }

    public set sunLight (val: DirectionalLight) {
        this.sunLight.copy(val);
        this.setSunLightPosition();
    }

    public readonly fog: Fog;

    public constructor (camera: EarthCamera, imageryTileProvider: IImageryTileProvider, terrainProvider: ITerrainProvider, tileCacheSize: number) {
        this.camera = camera;
        this._renderer = camera.renderer;
        //add fog to renderer scene
        this.fog = new Fog(this._renderer.scene, new Color(InternalConfig.DEFAULT_FOG_COLOR), InternalConfig.DEFAULT_FOG_DENSITY);
        this.tileNodeRenderer = new TileNodeRenderer(this.fog);
        //将渲染根节点添加到场景中
        this._renderer.scene.add(this.tileNodeRenderer.root);
        this.imageryProviders = new ImageryTileProviderCollection();
        this.imageryProviders.add(imageryTileProvider);
        this.entities = new EntityCollection();
        this.primitives = new PrimitiveCollection();
        //将渲染根节点添加到场景中
        this._renderer.scene.add(this.primitives.root);
        this.quadtreePrimitive = new QuadtreePrimitive(this.imageryProviders.get(0)!, tileCacheSize);
        this.tilingScheme = this.quadtreePrimitive.tileProvider.tilingScheme;
        this.globleSurfaceManager = new GlobeSurfaceTileManager(this.quadtreePrimitive, terrainProvider, this);
        this.dataSourceDisplay = new DataSourceDisplay(this.entities, this.tilingScheme, this._renderer);
        //将DataSource的渲染根节点添加到场景中
        this._renderer.scene.add(this.dataSourceDisplay.root);
        this._picking = new Picking(this);
        this.setSunLightPosition();
        //add light to renderer scene
        this._renderer.scene.add(this.ambientLight);
        this._renderer.scene.add(this.sunLight);
        this.ready = true;
    }

    public pick (screenPos: ICartesian2Like) {
        return this._picking.pick(screenPos);
    }

    /**
     * 设置太阳光的位置
     */
    private setSunLightPosition () {
        //set sunLight position
        this.sunLight.position.copy(new Vector3(0, Transform.carCoordToWorldCoord(100000000), 0));
    }

    //设置最底下的瓦片提供者
    public setBaseImageryTileProvider (provider: IImageryTileProvider, oldProvider: IImageryTileProvider) {
        this.imageryProviders.remove(oldProvider);
        provider.visible = true;
        this.imageryProviders.lowerToBottom(provider);
        this.quadtreePrimitive.tileProvider = provider;
    }

    //渲染基元
    private renderPrimitive (frameState: FrameState) {
        for (let i = 0; i < this.primitives.size; i++) {
            const primitive = this.primitives.get(i);
            primitive.render(this, frameState);
        }
    }

    public postRender (delay: number) {
        if (!this.ready) return;
        let frameState = new FrameState(this._renderer.camera as PerspectiveCamera, this._renderer.size, this.fog);
        if (frameState.cameraChanged) {
            this.camera.changedEvent.emit(null);
        }
        this.globleSurfaceManager.render(delay, frameState);
        this.renderPrimitive(frameState);
        frameState.endFrame();
    }

    public renderLateUpdate (delay: number) {
        this.dataSourceDisplay.lateUpdate(delay);
        this.lateUpdateEvent.invoke(delay);
    }


    public destroy () {
    }

}