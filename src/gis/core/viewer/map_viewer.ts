import { PerspectiveCamera, Scene } from "three";
import { Director, director } from "../../../core/director";
import { Engine } from "../../../core/engine";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { interactionSystem } from "../../../core/system/interaction_system";
import { rendererSystem } from "../../../core/system/renderer_system";
import { Utils } from "../../../core/utils/utils";
import { MapViewerOptions } from "../../@types/core/gis";
import { ControlsLimit } from "../extend/controls_limit";
import { InternalConfig } from "../internal/internal_config";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { EarthScene } from "../scene/earth_scene";
import { GISTest } from "../test/test";
import { Transform } from "../transform/transform";

export class MapViewer {

    public readonly renderer: FrameRenderer;

    public readonly scene: EarthScene;

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

    public set imageryTileProivder (provider: IImageryTileProvider) {
        let oldImageryTileProvider = this._imageryTileProvider;
        this._imageryTileProvider = provider;
        this.scene?.setBaseImageryTileProvider(this._imageryTileProvider, oldImageryTileProvider);
    }

    constructor (viewerOptions: MapViewerOptions) {
        Engine.DEBUG = InternalConfig.DEBUG;
        Engine.init();
        Transform.THREEJS_UNIT_PER_METERS = Utils.defaultValue(viewerOptions.UNIT_PER_METERS, 10000);
        this.renderer = this.createRenderer(viewerOptions.target);
        this._imageryTileProvider = viewerOptions.imageryTileProivder;
        this.scene = new EarthScene(this.renderer, this.imageryTileProivder, Utils.defaultValue(viewerOptions.tileCacheSize, 100));
        this.enablePan = Utils.defaultValue(viewerOptions.enablePan, true);
        this.panSpeed = Utils.defaultValue(viewerOptions.panSpeed, 1.2);
        this.enableZoom = Utils.defaultValue(viewerOptions.enableZoom, true);
        this.zoomSpeed = Utils.defaultValue(viewerOptions.zoomSpeed, 2.0);
        this.enableRotate = Utils.defaultValue(viewerOptions.enableRotate, true);
        this.rotateSpeed = Utils.defaultValue(viewerOptions.rotateSpeed, 1.0);
        this.scene.camera.setViewPort(viewerOptions.homeViewPort);
        new ControlsLimit(this.renderer, this.scene).limit();

        director.addEventListener(Director.EVENT_DRAW_FRAME, this.renderFrame, this);

    }

    /**
     * 创建渲染对象
     * @param target 
     */
    private createRenderer (target: string | HTMLElement) {
        const ele = typeof target === 'string' ? document.getElementById(target) : target;
        const scene = new Scene();
        const camera = new PerspectiveCamera(45, ele.clientWidth / ele.clientHeight, 0.00001, Transform.THREEJS_UNIT_PER_METERS * 100);
        const renderer = new FrameRenderer(scene, camera, target as HTMLElement);
        rendererSystem.addRenderTarget(renderer)
        interactionSystem.enableInteraction(renderer);
        //run test code
        GISTest.run(renderer);
        return renderer;
    }

    /**
     * 按帧渲染
     */
    renderFrame (delay: number) {
        this.scene!.postRender(delay);
    }

    renderLateUpdate (delay: number) {
        this.scene!.renderLateUpdate(delay);
    }

    destroy () {
        this.scene?.destroy();
    }

}