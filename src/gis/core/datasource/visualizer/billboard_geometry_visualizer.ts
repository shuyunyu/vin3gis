import { Object3D, Event, Texture, SpriteMaterial, PerspectiveCamera, InstancedMesh, BufferGeometry, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Vector3, Vector2, Shader, WebGLRenderer } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { billboardGeometryCanvasProvider } from "../../misc/provider/billboard_geometry_canvas_provider";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

let bufferGeometry: BufferGeometry;

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    private _mesh?: InstancedMesh;

    private _canvas?: HTMLCanvasElement;

    private getBufferGeometry () {
        if (bufferGeometry) return bufferGeometry;
        bufferGeometry = new BufferGeometry();
        const float32Array = new Float32Array([
            - 0.5, - 0.5, 0, 0, 0,
            0.5, - 0.5, 0, 1, 0,
            0.5, 0.5, 0, 1, 1,
            - 0.5, 0.5, 0, 0, 1
        ]);

        const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

        bufferGeometry.setIndex([0, 1, 2, 0, 2, 3]);
        bufferGeometry.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
        bufferGeometry.setAttribute('uv', new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
        return bufferGeometry;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer): Object3D<Event> {
        const billboard = entity.billboard;
        if (!billboard.ready) return null;
        const canvas = billboardGeometryCanvasProvider.createCanvas({
            image: billboard.texImageSource,
            width: billboard.width,
            height: billboard.height,
            center: billboard.center
        });

        this._canvas = canvas;

        const texture = new Texture(canvas);
        texture.needsUpdate = true;

        const mtl = new SpriteMaterial({
            sizeAttenuation: false,
            map: texture,
            transparent: true,
            depthTest: false,
            //@ts-ignore
            onBeforeCompile: (shader: Shader, renderer: WebGLRenderer) => {
                shader.vertexShader = shader.vertexShader.replace(
                    /modelMatrix/g,
                    `curModelMatrix`)
                    .replace(/\( rotation \)/g, '( curRotation )')
                    .replace(
                        `vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );`,
                        `#ifdef USE_INSTANCING
                            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0 );
                            mat4 curModelMatrix = modelMatrix * instanceMatrix;

                            float curRotation = curModelMatrix[2].z;

                         #endif
                         #ifndef USE_INSTANCING
                            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
                            mat4 curModelMatrix = modelMatrix;

                            float curRotation = rotation;

                         #endif
                    `);
            }
        });
        const geometry = this.getBufferGeometry();
        const mesh = new InstancedMesh(geometry, mtl, billboard.instanceCount);
        //@ts-ignore
        mesh.center = new Vector2(0.5, 0.5);
        this._mesh = mesh;

        this.update(entity, tilingScheme, root, renderer);

        this._disposableObjects.push(mesh, mtl, texture);

        return mesh;

    }

    public remove (entity: Entity, root: Object3D<Event>): void {
        super.remove(entity, root);
        this._mesh = null;
        this._canvas = null;
    }

    /**
     * resize时 重新设置一下缩放
     * @param renderer 
     * @returns 
     */
    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) {
        this.update(entity, tilingScheme, root, renderer);
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (!this._mesh) return;

        const billboardRenderData = entity.billboard.getRenderData();
        for (let i = 0; i < billboardRenderData.length; i++) {
            const renderData = billboardRenderData[i];
            const coord = Transform.cartographicToWorldVec3(renderData.position, tilingScheme);
            const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
            const xScale = this._canvas.width * factor / renderer.size.height;
            const yScale = this._canvas.height * factor / renderer.size.height;
            const scale = renderData.scale;
            const matrix = new Matrix4();
            matrix.setPosition(coord.x, coord.y, coord.z).scale(new Vector3(xScale * scale, yScale * scale, renderData.rotation));
            this._mesh.setMatrixAt(i, matrix);
        }


        this._mesh.instanceMatrix.needsUpdate = true;
    }

}