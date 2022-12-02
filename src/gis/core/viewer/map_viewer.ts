import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { Utils } from "../../../core/utils/utils";
import { MapViewerOptions } from "../../@types/core/gis";
import { ControlsLimit } from "../extend/controls_limit";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { EarthScene } from "../scene/earth_scene";

export class MapViewer {

    public readonly renderer: FrameRenderer;

    public readonly scene: EarthScene;

    //瓦片提供者
    private _imageryTileProvider: IImageryTileProvider;

    //是否允许 双击放大地图
    private _enableDblclickZoom: boolean;

    //是否允许 平移
    private _enablePan: boolean;

    //是否允许 缩放
    private _enableZoom: boolean;

    //是否允许 倾斜
    private _enablePitch: boolean;

    //是否允许旋转
    private _enableRotate: boolean;

    public get imageryTileProivder () {
        return this._imageryTileProvider;
    }

    public get dblClickZoom () {
        return this._enableDblclickZoom;
    }

    public set dblClickZoom (enable: boolean) {
        this._enableDblclickZoom = enable;
    }

    public get enablePan () {
        return this._enablePan;
    }

    public set enablePan (enable: boolean) {
        this._enablePan = enable;
    }

    public get enableZoom () {
        return this._enableZoom;
    }

    public set enableZoom (enable: boolean) {
        this._enableZoom = enable;
    }

    public get enablePitch () {
        return this._enablePitch;
    }

    public set enablePitch (enable: boolean) {
        this._enablePitch = enable;
    }

    public get enableRotate () {
        return this._enableRotate;
    }

    public set enableRotate (enable: boolean) {
        this._enableRotate = enable;
    }

    public set imageryTileProivder (provider: IImageryTileProvider) {
        let oldImageryTileProvider = this._imageryTileProvider;
        this._imageryTileProvider = provider;
        this.scene?.setBaseImageryTileProvider(this._imageryTileProvider, oldImageryTileProvider);
    }

    constructor (viewerOptions: MapViewerOptions) {
        this.renderer = viewerOptions.renderer;
        this._imageryTileProvider = viewerOptions.imageryTileProivder;
        this.scene = new EarthScene(this.renderer, this.imageryTileProivder, Utils.defaultValue(viewerOptions.tileCacheSize, 100));
        this._enableDblclickZoom = Utils.defaultValue(viewerOptions.dblClickZoom, true);
        this._enablePan = Utils.defaultValue(viewerOptions.enablePan, true);
        this._enableZoom = Utils.defaultValue(viewerOptions.enableZoom, true);
        this._enablePitch = Utils.defaultValue(viewerOptions.enablePitch, true);
        this._enableRotate = Utils.defaultValue(viewerOptions.enableRotate, true);
        this.scene.camera.setViewPort(viewerOptions.homeViewPort);
        new ControlsLimit(this.renderer, this.scene).limit();
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