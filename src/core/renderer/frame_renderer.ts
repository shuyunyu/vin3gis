import * as THREE from "three"
import { OrthographicCamera, PerspectiveCamera, Renderer, Scene, WebGLRendererParameters } from "three";
import { Partial, RTS } from "../../@types/global/global";

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
     * 更新相机的rts
     * @param rts 
     */
    updateCameraRTS (rts: Partial<RTS>) {
        let needUpdate = false;
        if (rts.position) {
            this._camera.position.copy(rts.position);
            needUpdate = true;
        }
        if (rts.rotation) {
            this._camera.quaternion.copy(rts.rotation);
            needUpdate = true;
        }
        if (rts.scale) {
            needUpdate = true;
            this._camera.scale.copy(rts.scale);
        }
        if (needUpdate) {
            this._camera.updateMatrix();
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