import * as THREE from "three"
import { OrthographicCamera, PerspectiveCamera, Renderer, Scene, WebGLRendererParameters } from "three";

/**
 * 帧渲染器
 */
export class FrameRenderer {

    private _renderer: Renderer;

    private _scene: Scene;

    public get scene () {
        return this._scene;
    }

    private _camera: PerspectiveCamera | OrthographicCamera;

    public get camera () {
        return this._camera;
    }

    private _target: HTMLElement;

    //renderer's domElement
    public get domElement () {
        return this._renderer.domElement;
    }

    public get interactionElement () {
        return this._renderer.domElement.parentElement;
    }

    private _destroyed: boolean = false;

    public constructor (scene: Scene, camera: PerspectiveCamera | OrthographicCamera, target: HTMLElement, rendererParams?: WebGLRendererParameters) {
        this._renderer = new THREE.WebGLRenderer(Object.assign({ antialias: true }, rendererParams));
        //@ts-ignore
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._scene = scene;
        this._camera = camera;
        this._target = target;
        this._target.appendChild(this.domElement);
    }

    /**
     * 更新渲染尺寸
     * @param width 
     * @param height 
     */
    public updateRenderSize () {
        const width = this._target.clientWidth;
        const height = this._target.clientHeight;
        this._renderer.setSize(width, height);
        if (this._camera instanceof THREE.PerspectiveCamera) {
            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();
        } else if (this._camera instanceof THREE.OrthographicCamera) {

        }
    }

    /**
     * 更新每一帧
     * @param dt 
     */
    public update (dt: number) {
        this._renderer.render(this._scene, this._camera);
    }

    public destroy () {
        if (this._destroyed) return;
        this._target.removeChild(this.domElement);
        //@ts-ignore
        this._renderer.dispose();
        this._destroyed = true;
        this._renderer = null;
        this._scene = null;
        this._camera = null;
        this._target = null;
    }

}