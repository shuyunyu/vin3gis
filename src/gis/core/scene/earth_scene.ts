import { PerspectiveCamera } from "three";
import { GenericEvent } from "../../../core/event/generic_event";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { EarthCamera } from "../camera/earth_camera";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { FrameState } from "./frame_state";
import { GlobeSurfaceTileManager } from "./globe_surface_tile_manager";
import { QuadtreePrimitive } from "./quad_tree_primitive";

export class EarthScene {

    public readonly ready: boolean = false;

    public readonly camera: EarthCamera;

    private _renderer: FrameRenderer;

    private _globleSurfaceManager: GlobeSurfaceTileManager | undefined;

    public readonly imageryProviders: ImageryTileProviderCollection;

    public readonly tilingScheme: ITilingScheme;

    private _quadtreePrimitive: QuadtreePrimitive;

    public readonly lateUpdateEvent = new GenericEvent<number>;

    constructor (renderer: FrameRenderer, imageryTileProvider: IImageryTileProvider, tileCacheSize: number) {
        this._renderer = renderer;
        this.imageryProviders = new ImageryTileProviderCollection();
        this.initEventListeners();
        this.imageryProviders.add(imageryTileProvider);
        this._quadtreePrimitive = new QuadtreePrimitive(this.imageryProviders.get(0)!, tileCacheSize);
        this.tilingScheme = this._quadtreePrimitive.tileProvider.tilingScheme;
        this.camera = new EarthCamera(this._renderer, this.tilingScheme);
        this._globleSurfaceManager = new GlobeSurfaceTileManager(this._quadtreePrimitive, this);
        this.ready = true;
    }


    //设置最底下的瓦片提供者
    public setBaseImageryTileProvider (provider: IImageryTileProvider, oldProvider: IImageryTileProvider) {
        this.imageryProviders.remove(oldProvider);
        provider.visible = true;
        this.imageryProviders.lowerToBottom(provider);
        this._quadtreePrimitive.tileProvider = provider;
    }

    //初始化事件监听
    private initEventListeners () {
        this.imageryProviders.providerAdded.addEventListener(this.onImageryTileProvderAdded, this);
        this.imageryProviders.providerRemoved.addEventListener(this.onImageryTileProviderRemoved, this);
    }

    //移除事件监听
    private removeEventListeners () {
        this.imageryProviders.providerAdded.removeEventListener(this.onImageryTileProvderAdded, this);
        this.imageryProviders.providerRemoved.removeEventListener(this.onImageryTileProviderRemoved, this);
    }

    private onImageryTileProvderAdded (provider: IImageryTileProvider) {
        //挂载瓦片节点
        // provider.renderTileToNode(ResourceCenter.tileRootNode);
        this._renderer.scene.add(provider.tileNodeContainer.object3d);
    }

    private onImageryTileProviderRemoved (provider: IImageryTileProvider) {
        // provider.node.removeFromParent();
        this._renderer.scene.remove(provider.tileNodeContainer.object3d);
    }


    public postRender (delay: number) {
        if (!this.ready) return;
        let frameState = new FrameState(this._renderer.camera as PerspectiveCamera, this._renderer.domElement);
        this._globleSurfaceManager.render(delay, frameState);
        this.camera.postRender(delay, frameState);
        frameState.endFrame();
    }

    public renderLateUpdate (delay: number) {
        this.lateUpdateEvent.invoke(delay);
    }


    public destroy () {
        this.removeEventListeners();
    }

}