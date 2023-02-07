import { Object3D, Event, Texture, SpriteMaterial, PerspectiveCamera, InstancedMesh, BufferGeometry, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Vector3, Vector2, Shader, WebGLRenderer } from "three";
import { math } from "../../../../core/math/math";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { Utils } from "../../../../core/utils/utils";
import { GeometryPropertyChangeData } from "../../../@types/core/gis";
import { SpriteShaderExt } from "../../extend/sprite_shader_ext";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";
import { Entity } from "../entity";
import { BillboardSingleRenderData } from "../geometry/base_billboard_geometry";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class BillboardGeometryVisualizer extends BaseGeometryVisualizer {

    private _mesh?: InstancedMesh;

    private _texSourceImage: TexImageSource;

    private getBufferGeometry () {
        const bufferGeometry = new BufferGeometry();
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
                shader.vertexShader = SpriteShaderExt.extShader(shader);
            }
        });
        const geometry = this.getBufferGeometry();
        const mesh = new InstancedMesh(geometry, mtl, this.getInstanceCount(entity));
        //@ts-ignore
        mesh.center = new Vector2(0.5, 0.5);
        this._mesh = mesh;
        for (let i = 0; i < mesh.count; i++) {
            const matrix = new Matrix4();
            matrix.scale(new Vector3(0, 0, 0));
            mesh.setMatrixAt(i, matrix);
        }
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

        for (let i = 0; i < billboardRenderData.length; i++) {
            const renderData = billboardRenderData[i];
            const coord = Transform.cartographicToWorldVec3(renderData.position, tilingScheme);
            const scale = renderData.scale;

            //将宽高属性设置到scale上来达到效果
            const wScale = Utils.defined(renderData.width) ? renderData.width / this._texSourceImage.width : 1;
            const hScale = Utils.defined(renderData.height) ? renderData.height / this._texSourceImage.height : 1;


            const matrix = SpriteShaderExt.createInstanceMatrix({
                position: coord,
                scale: new Vector2(xScale * scale * wScale, yScale * scale * hScale),
                rotation: renderData.rotation,
                uvRange: { xmin: 0, xmax: 1, ymin: 0, ymax: 1 },
                anchor: renderData.anchor || new Vector2(0.5, 0.5)
            })
            this._mesh.setMatrixAt(i, matrix);

        }

        this._mesh.instanceMatrix.needsUpdate = true;
    }

}