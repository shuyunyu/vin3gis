import { PerspectiveCamera, Scene } from "three";
import { Director, director } from "../../../core/director";
import { Engine } from "../../../core/engine";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { interactionSystem } from "../../../core/system/interaction_system";
import { rendererSystem } from "../../../core/system/renderer_system";
import { Utils } from "../../../core/utils/utils";
import { DebugTools } from "../../../tools/debug_tools";
import { MapViewerOptions } from "../../@types/core/gis";
import { MapStatsMonitor } from "../../monitor/map_stats_monitor";
import { ControlsLimit } from "../extend/controls_limit";
import { InternalConfig } from "../internal/internal_config";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { EarthScene } from "../scene/earth_scene";
import { SimpleTerrainProvider } from "../terrain/simple_terrain_provider";
import { ITerrainProvider } from "../terrain/terrain_provider";
import { Transform } from "../transform/transform";

export class MapViewer {

    public readonly renderer: FrameRenderer;

    public readonly scene: EarthScene;

    private _mapStatsMonitor?: MapStatsMonitor;

    //地形提供者
    private _terrainProvider: ITerrainProvider;

    //瓦片提供者
    private _imageryTileProvider: IImageryTileProvider;

    //是否允许 平移
    private _enablePan: boolean;

    private _panSpeed: number;

    //是否允许 缩放
    private _enableZoom: boolean;

    private _zoomSpeed: number;

    //是否允许旋转
    private _enableRotate: boolean;

    private _rotateSpeed: number;

    //是否允许惯性
    private _enableDamping: boolean;

    //惯性系数
    private _dampingFactor: number;

    //视角能推进的最小距离
    private _minDistance: number;

    //视角能推进的最大距离
    private _maxDistance: number;

    private _fov: number;

    public get imageryTileProivder () {
        return this._imageryTileProvider;
    }

    public get enablePan () {
        return this._enablePan;
    }

    public set enablePan (enable: boolean) {
        this._enablePan = enable;
        interactionSystem.updateControlsProps(this.renderer, { enablePan: enable });
    }

    public get panSpeed () {
        return this._panSpeed;
    }

    public set panSpeed (val: number) {
        this._panSpeed = val;
        interactionSystem.updateControlsProps(this.renderer, { panSpeed: val });
    }

    public get enableZoom () {
        return this._enableZoom;
    }

    public set enableZoom (enable: boolean) {
        this._enableZoom = enable;
        interactionSystem.updateControlsProps(this.renderer, { enableZoom: enable });
    }

    public get zoomSpeed () {
        return this._zoomSpeed;
    }

    public set zoomSpeed (val: number) {
        this._zoomSpeed = val;
        interactionSystem.updateControlsProps(this.renderer, { zoomSpeed: val });
    }

    public get enableRotate () {
        return this._enableRotate;
    }

    public set enableRotate (enable: boolean) {
        this._enableRotate = enable;
        interactionSystem.updateControlsProps(this.renderer, { enableRotate: enable });
    }

    public get rotateSpeed () {
        return this._rotateSpeed;
    }

    public set rotateSpeed (val: number) {
        this._rotateSpeed = val;
        interactionSystem.updateControlsProps(this.renderer, { rotateSpeed: val });
    }

    public get enableDamping () {
        return this._enableDamping;
    }

    public set enableDamping (val: boolean) {
        this._enableDamping = val;
        interactionSystem.updateControlsProps(this.renderer, { enableDamping: val });
    }

    public get dampingFactor () {
        return this._dampingFactor;
    }

    public set dampingFactor (val: number) {
        this._dampingFactor = val;
        interactionSystem.updateControlsProps(this.renderer, { dampingFactor: val });
    }

    public get minDistance () {
        return this._minDistance;
    }

    public set minDistance (val: number) {
        this._minDistance = val;
        interactionSystem.updateControlsProps(this.renderer, { minDistance: val });
    }

    public get maxDistance () {
        return this._maxDistance;
    }

    public set maxDistance (val: number) {
        this._maxDistance = val;
        interactionSystem.updateControlsProps(this.renderer, { maxDistance: val });
    }

    public get fov () {
        return this._fov;
    }

    public set fov (val: number) {
        this._fov = val;
        this.renderer.updateCameraProps({ fov: val });
    }

    public set imageryTileProivder (provider: IImageryTileProvider) {
        let oldImageryTileProvider = this._imageryTileProvider;
        this._imageryTileProvider = provider;
        this.scene?.setBaseImageryTileProvider(this._imageryTileProvider, oldImageryTileProvider);
    }

    constructor (viewerOptions: MapViewerOptions) {
        Engine.DEBUG = InternalConfig.DEBUG;
        Engine.init();
        Transform.THREEJS_UNIT_PER_METERS = Utils.defaultValue(viewerOptions.UNIT_PER_METERS, 10000);
        this._fov = Utils.defaultValue(viewerOptions.fov, 30);
        this.renderer = this.createRenderer(viewerOptions.target);
        this._terrainProvider = new SimpleTerrainProvider();
        this._imageryTileProvider = viewerOptions.imageryTileProivder;
        this.scene = new EarthScene(this.renderer, this.imageryTileProivder, this._terrainProvider, Utils.defaultValue(viewerOptions.tileCacheSize, InternalConfig.DEFAUTL_MAX_TILE_CACHE_COUNT));
        this.enablePan = Utils.defaultValue(viewerOptions.enablePan, true);
        this.panSpeed = Utils.defaultValue(viewerOptions.panSpeed, 1.2);
        this.enableZoom = Utils.defaultValue(viewerOptions.enableZoom, true);
        this.zoomSpeed = Utils.defaultValue(viewerOptions.zoomSpeed, 2.0);
        this.enableRotate = Utils.defaultValue(viewerOptions.enableRotate, true);
        this.rotateSpeed = Utils.defaultValue(viewerOptions.rotateSpeed, 1.0);
        this.dampingFactor = Utils.defaultValue(viewerOptions.dampingFactor, 0.05);
        this.enableDamping = Utils.defaultValue(viewerOptions.enableDamping, true);
        this.minDistance = Utils.defaultValue(viewerOptions.minDistance, 0.0);
        this.maxDistance = Utils.defaultValue(viewerOptions.maxDistance, Infinity) / Transform.THREEJS_UNIT_PER_METERS;
        this.scene.camera.setViewPort(viewerOptions.homeViewPort);
        new ControlsLimit(this.renderer, this.scene).limit();
        //start a monitor
        if (DebugTools.getRendererStats(this.renderer)) {
            this._mapStatsMonitor = new MapStatsMonitor(this.renderer, this.scene);
        }

        director.addEventListener(Director.EVENT_DRAW_FRAME, this.renderFrame, this);

    }

    /**
     * 创建渲染对象
     * @param target 
     */
    private createRenderer (target: string | HTMLElement) {
        const ele = typeof target === 'string' ? document.getElementById(target) : target;
        const scene = new Scene();
        const camera = new PerspectiveCamera(this._fov, ele.clientWidth / ele.clientHeight, 0.00001, Transform.THREEJS_UNIT_PER_METERS * 100);
        const renderer = new FrameRenderer(scene, camera, target as HTMLElement);
        rendererSystem.addRenderTarget(renderer)
        interactionSystem.enableInteraction(renderer);
        return renderer;
    }

    /**
     * 按帧渲染
     */
    renderFrame (delay: number) {
        this.scene.postRender(delay);
        if (this._mapStatsMonitor) this._mapStatsMonitor.update();
    }

    renderLateUpdate (delay: number) {
        this.scene.renderLateUpdate(delay);
    }

    destroy () {
        this.scene?.destroy();
    }

}