import * as THREE from "three";
import { Camera, Renderer, Scene } from "three";
import { SystemDefines } from "../../@types/core/system/system";
import { FrameRenderer } from "../renderer/frame_renderer";
import { System } from "./system";

export class RendererSystem extends System {

    private static _instance?: RendererSystem;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new RendererSystem();
        return this._instance;
    }

    private _renderer: Renderer;

    private _frameRenderer?: FrameRenderer;

    private constructor () {
        super();
        this.priority = SystemDefines.Priority.HIGH;
    }

    public init (): void {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer = renderer;
        this.initEventListener();
    }

    private initEventListener () {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private onWindowResize () {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public render (target: HTMLElement, scene: Scene, camera: Camera) {
        if (this._frameRenderer) this._frameRenderer.destroy();
        this._frameRenderer = new FrameRenderer(this._renderer, scene, camera);
        target.appendChild(this._renderer.domElement);
    }

    public update (dt: number): void {
        this._frameRenderer?.update(dt);
    }

}

export const rendererSystem = RendererSystem.instance;