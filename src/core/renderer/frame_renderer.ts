import { Camera, Renderer, Scene } from "three";

/**
 * 帧渲染器
 */
export class FrameRenderer {

    private _renderer: Renderer;

    private _scene: Scene;

    private _camera: Camera;

    public constructor (renderer: Renderer, scene: Scene, camera: Camera) {
        this._renderer = renderer;
        this._scene = scene;
        this._camera = camera;
    }

    public update (dt: number) {
        this._renderer.render(this._scene, this._camera);
    }

    public destroy () {
        this._renderer = null;
        this._scene = null;
        this._camera = null;
    }

}