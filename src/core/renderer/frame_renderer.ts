import * as THREE from "three"
import { Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Renderer, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import { GeometryUtils } from "../utils/geometry_utils";
import { Object3Utils } from "../utils/object3_utils";

/**
 * 帧渲染器
 */
export class FrameRenderer {

    private _renderer: WebGLRenderer;

    public get renderer () {
        return this._renderer;
    }

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

    /**
     * 获取当前场景中几何体的占用的内存
     */
    public get geometryMemory () {
        let total = 0;
        Object3Utils.foreachObject3(this._scene, (o: Object3D) => {
            if (o instanceof Mesh) {
                if (o.geometry) {
                    total += GeometryUtils.getGeometryByteLength(o.geometry);
                }
            }
        });
        return total;
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