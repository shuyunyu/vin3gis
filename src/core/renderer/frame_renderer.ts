import { Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import { OrthographicCameraProps, PerspectiveCameraProps } from "../../@types/global/global";
import { GenericEvent } from "../event/generic_event";
import { Size } from "../misc/size";
import { GeometryUtils } from "../utils/geometry_utils";
import { Object3Utils } from "../utils/object3_utils";
import { Utils } from "../utils/utils";

/**
 * 帧渲染器
 */
export class FrameRenderer {

    //渲染器resize执行之后触发的事件
    public readonly resizeEvent = new GenericEvent<FrameRenderer>();

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

    private _size: Size = new Size();

    public get size () {
        return this._size;
    }

    private _updateRenderSize: Function;

    /**
     * 更新渲染尺寸的方法
     *  - 经过了防抖处理
     */
    public get updateRenderSize () {
        return this._updateRenderSize;
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
        this._renderer = new WebGLRenderer(Object.assign({ antialias: true }, rendererParams));
        //@ts-ignore
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._scene = scene;
        this._camera = camera;
        this._target = target;
        this._target.appendChild(this.domElement);
        //预先设置好渲染尺寸
        this.internalUpdateRenderSize(false);
        this._updateRenderSize = Utils.debounce(this.internalUpdateRenderSize, this, 100);

    }

    /**
     * 更新渲染尺寸
     * @param width 
     * @param height 
     */
    private internalUpdateRenderSize (emitEvent: boolean = true) {
        const width = this._target.clientWidth;
        const height = this._target.clientHeight;
        if (this._size.width === width && this._size.height === height) return;
        if (this._camera instanceof PerspectiveCamera) {
            this._renderer.setSize(width, height);
            this.updateCameraProps({ aspect: width / height });
            this._size.width = width;
            this._size.height = height;
        } else if (this._camera instanceof OrthographicCamera) {

        }
        if (emitEvent) {
            this.resizeEvent.emit(this);
        }
    }

    /**
     * 更新相机的属性
     * @param props 
     */
    public updateCameraProps (props: PerspectiveCameraProps | OrthographicCameraProps) {
        if (this._camera instanceof PerspectiveCamera) {
            const cprops = props as PerspectiveCameraProps;
            let changed = false;
            if (Utils.defined(cprops.near)) {
                this._camera.near = cprops.near;
                changed = true;
            }
            if (Utils.defined(cprops.far)) {
                this._camera.far = cprops.far;
                changed = true;
            }
            if (Utils.defined(cprops.aspect)) {
                this._camera.aspect = cprops.aspect;
                changed = true;
            }
            if (Utils.defined(cprops.fov)) {
                this._camera.fov = cprops.fov;
                changed = true;
            }
            if (changed) {
                this._camera.updateProjectionMatrix();
            }
        } else if (this._camera instanceof OrthographicCamera) {
            const cprops = props as OrthographicCameraProps;
            let changed = false;
            if (Utils.defined(cprops.near)) {
                this._camera.near = cprops.near;
                changed = true;
            }
            if (Utils.defined(cprops.far)) {
                this._camera.far = cprops.far;
                changed = true;
            }
            if (Utils.defined(cprops.left)) {
                this._camera.left = cprops.left;
                changed = true;
            }
            if (Utils.defined(cprops.right)) {
                this._camera.right = cprops.right;
                changed = true;
            }
            if (Utils.defined(cprops.bottom)) {
                this._camera.bottom = cprops.bottom;
                changed = true;
            }
            if (Utils.defined(cprops.top)) {
                this._camera.top = cprops.top;
                changed = true;
            }
            if (changed) {
                this._camera.updateProjectionMatrix();
            }
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