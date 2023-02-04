import { Object3D, Event, Texture, SpriteMaterial, PerspectiveCamera, InstancedMesh, BufferGeometry, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Vector3, Vector2, Shader, WebGLRenderer, Color } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Utils } from "../../../../core/utils/utils";
import { GeometryPropertyChangeData, ICartesian2Like } from "../../../@types/core/gis";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BillboardSingleRenderData } from "../geometry/base_billboard_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    private _mesh?: InstancedMesh;

    private _texSourceImage: TexImageSource;

    private getBufferGeometry (entity: Entity) {
        const anchor = this.getImageAnchor(entity);
        const bufferGeometry = new BufferGeometry();
        const float32Array = new Float32Array([
            -1 + anchor.x, -anchor.y, 0, 0, 0,
            anchor.x, -anchor.y, 0, 1, 0,
            anchor.x, 1 - anchor.y, 0, 1, 1,
            -1 + anchor.x, 1 - anchor.y, 0, 0, 1
        ]);

        const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

        bufferGeometry.setIndex([0, 1, 2, 0, 2, 3]);
        bufferGeometry.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
        bufferGeometry.setAttribute('uv', new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
        return bufferGeometry;
    }

    /**
     * 是否使用动态uv
     * - 子类需要重写此方法
     * - 如果使用动态uv 那么会使用instanceColor的rgb代表uv.xmin,uv.xmax,uv.ymin,rotation代表uv.ymax,因为rotation数据被占用，所以无法动态修改rotation
     * @returns 
     */
    protected useDynamicUV () {
        return false;
    }

    /**
     * 获取图片的锚点
     * - 子类需要重写此方法
     * @param entity 
     */
    protected getImageAnchor (entity: Entity): ICartesian2Like {
        return entity.billboard.center;
    }

    /**
     * 获取贴图数据源
     * @param entity 
     * @returns 
     */
    protected getTexImageSource (entity: Entity) {
        const billboard = entity.billboard;
        return billboard.texImageSource as TexImageSource;
    }

    /**
     * 校验准备状态
     * @param entity 
     * @returns 
     */
    protected checkReady (entity: Entity) {
        return entity.billboard.ready;
    }

    /**
     * 获取实例数量
     * @param entity 
     * @returns 
     */
    protected getInstanceCount (entity: Entity) {
        return entity.billboard.instanceCount;
    }

    protected createGeometryObject (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer): Object3D<Event> {
        if (!this.checkReady(entity)) return null;

        this._texSourceImage = this.getTexImageSource(entity);

        const texture = new Texture(this._texSourceImage);
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
                        `#include <uv_vertex>`,
                        `
                        #include <uv_vertex>

                        #ifdef USE_INSTANCING_COLOR

                            if (vUv.x == 0.0) {
                                vUv.x = instanceColor.x;
                            }
                            if (vUv.x == 1.0) {
                                vUv.x = instanceColor.y;
                            }
                            if (vUv.y == 0.0) {
                                vUv.y = instanceColor.z;
                            }
                            if (vUv.y == 1.0) {
                                vUv.y = instanceMatrix[2].z;
                            }
                        #endif
                        `)
                    .replace(
                        `vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );`,
                        `#ifdef USE_INSTANCING
                            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0 );
                            mat4 curModelMatrix = modelMatrix * instanceMatrix;

                            float curRotation = curModelMatrix[2].z;

                            #ifdef USE_INSTANCING_COLOR

                               curRotation = 0.0;

                            #endif

                         #endif
                         #ifndef USE_INSTANCING
                            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
                            mat4 curModelMatrix = modelMatrix;

                            float curRotation = rotation;

                         #endif
                    `);
            }
        });
        const geometry = this.getBufferGeometry(entity);
        const mesh = new InstancedMesh(geometry, mtl, this.getInstanceCount(entity));
        //@ts-ignore
        mesh.center = new Vector2(0.5, 0.5);
        this._mesh = mesh;

        this.update(entity, tilingScheme, root, renderer);

        this._disposableObjects.push(mesh, mtl, texture, geometry);

        return mesh;

    }

    public remove (entity: Entity, root: Object3D<Event>): void {
        super.remove(entity, root);
        this._mesh = null;
        this._texSourceImage = null;
    }

    /**
     * resize时 重新设置一下缩放
     * @param renderer 
     * @returns 
     */
    public onRendererSize (entity: Entity, tilingScheme: ITilingScheme, root: Object3D, renderer: FrameRenderer) {
        this.update(entity, tilingScheme, root, renderer);
    }

    /**
     * 获取渲染数据
     * @param entity 
     * @returns 
     */
    protected getRenderData (entity: Entity): BillboardSingleRenderData[] {
        return entity.billboard.getRenderData();
    }

    public update (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>, renderer: FrameRenderer, propertyChangeData?: GeometryPropertyChangeData): void {
        if (!this._mesh) return;

        const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
        const xScale = this._texSourceImage.width * factor / renderer.size.height;
        const yScale = this._texSourceImage.height * factor / renderer.size.height;

        const billboardRenderData = this.getRenderData(entity);

        const useDynamicUv = this.useDynamicUV();

        for (let i = 0; i < billboardRenderData.length; i++) {
            const renderData = billboardRenderData[i];
            const coord = Transform.cartographicToWorldVec3(renderData.position, tilingScheme);
            const scale = renderData.scale;

            //将宽高属性设置到scale上来达到效果
            const wScale = Utils.defined(renderData.width) ? renderData.width / this._texSourceImage.width : 1;
            const hScale = Utils.defined(renderData.height) ? renderData.height / this._texSourceImage.height : 1;

            const matrix = new Matrix4();
            matrix.setPosition(coord.x, coord.y, coord.z).scale(new Vector3(xScale * scale * wScale, yScale * scale * hScale, useDynamicUv ? renderData.uvRange.ymax : renderData.rotation));
            this._mesh.setMatrixAt(i, matrix);

            if (useDynamicUv) {
                this._mesh.setColorAt(i, new Color(renderData.uvRange.xmin, renderData.uvRange.xmax, renderData.uvRange.ymin));
                this._mesh.instanceColor.needsUpdate = true;
            }

        }

        this._mesh.instanceMatrix.needsUpdate = true;
    }

}