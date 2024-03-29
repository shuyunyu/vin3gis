import { BufferGeometry, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, PerspectiveCamera, SpriteMaterial, Vector2, Vector3 } from "three";
import { RectangleRange } from "../../../../@types/global/global";
import { math } from "../../../../core/math/math";
import { Size } from "../../../../core/misc/size";
import { TiledTexture, TiledTextureResult } from "../../../../core/misc/tiled_texture";
import { FrameRenderer } from "../../../../core/renderer/frame_renderer";
import { disposeSystem } from "../../../../core/system/dispose_system";
import { Utils } from "../../../../core/utils/utils";
import { ICartesian2Like } from "../../../@types/core/gis";
import { Cartographic } from "../../cartographic";
import { SpriteShaderExt } from "../../extend/sprite_shader_ext";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Transform } from "../../transform/transform";

type TiledTextureSprite = {
    tiledTexture: TiledTexture;
    geometry: BufferGeometry;
    material: SpriteMaterial;
    mesh: InstancedMesh;
}

type RenderedSprite = {
    id: string;
    spriteIndex: number;
    tiledTextureResult: TiledTextureResult;
    options: RenderSpriteOptions;
}

type RenderedSpriteData = {
    renderedSprite: RenderedSprite;
    visible: boolean;
}

type RenderSpriteOptions = {
    position: Cartographic;
    spriteImage: CanvasImageSource;
    tilingScheme: ITilingScheme;
    renderer: FrameRenderer;
    rotation: number;
    anchor: ICartesian2Like;
    scale: { widthScale: number, heihgtScale: number },
    //指定的渲染尺寸
    specSize?: Size;
    //重新计算uv范围
    recalcUvRange?: (uvRange: RectangleRange, tileTextureSize: number, tileSize: number) => RectangleRange;
}

export class SpriteTextureAtlas {

    public readonly size: number;

    public readonly tileSize: number;

    private _sprites: TiledTextureSprite[] = [];

    //保存所有渲染好的Sprite
    private _renderedSpriteDataList: RenderedSpriteData[] = [];

    public constructor (size: number, tileSize: number) {
        this.size = size;
        this.tileSize = tileSize;
    }

    /**
     * 显示sprite
     * @param options 
     * @returns 
     */
    public showSprite (options: RenderSpriteOptions) {
        const sprite = this.getNextTiledTextureSprite();
        const tiledRes = sprite.tiledTexture.tileImage(options.spriteImage);
        if (options.recalcUvRange) {
            tiledRes.uvRange = options.recalcUvRange(tiledRes.uvRange, sprite.tiledTexture.size, sprite.tiledTexture.tileSize);
        }
        const id = Utils.createGuid();
        const spriteIndex = this._sprites.indexOf(sprite);
        const renderedSprite: RenderedSprite = {
            id: id,
            spriteIndex: spriteIndex,
            tiledTextureResult: tiledRes,
            options: Object.assign({}, options)
        }
        const data = { renderedSprite: renderedSprite, visible: true };
        this._renderedSpriteDataList.push(data);
        this.renderSprites([data]);
        return renderedSprite.id;
    }

    /**
     * 根据spriteId获取对应的Object
     * @param spriteId 
     * @returns 
     */
    public getSpriteById (spriteId: string) {
        const renderedSpriteData = this._renderedSpriteDataList.find(s => s.renderedSprite.id === spriteId);
        const spriteIndex = renderedSpriteData.renderedSprite.spriteIndex;
        return this._sprites[spriteIndex];
    }

    /**
     * 隐藏sprite
     * @param spriteId 
     */
    public setSpriteVisible (spriteId: string, visible: boolean) {
        const renderedSpriteData = this._renderedSpriteDataList.find(s => s.renderedSprite.id === spriteId);
        if (!renderedSpriteData) return;
        renderedSpriteData.visible = visible;
        this.renderSprites([renderedSpriteData]);
    }

    /**
     * 移除sprite
     * @param spriteId 
     */
    public removeSprite (spriteId: string) {
        const index = this._renderedSpriteDataList.findIndex(s => s.renderedSprite.id === spriteId);
        if (index === -1) return;
        this.setSpriteVisible(spriteId, false);
        const renderedSpriteData = this._renderedSpriteDataList.splice(index, 1)[0];
        const spriteIndex = renderedSpriteData.renderedSprite.spriteIndex;
        const sprite = this._sprites[spriteIndex];
        sprite.tiledTexture.disposeTileImage(renderedSpriteData.renderedSprite.tiledTextureResult.tileIndex);
        //如果当前使用的sprite是空的了 那么释放他对应的资源
        if (sprite.tiledTexture.isEmpty) {
            this._sprites.splice(spriteIndex, 1);
            if (sprite.mesh.parent) {
                sprite.mesh.removeFromParent();
            }
            [sprite.geometry, sprite.material, sprite.mesh, sprite.tiledTexture].forEach(item => disposeSystem.disposeObj(item));
        }
    }

    /**
     * 主渲染器resize时执行
     */
    public onRendererSize (render: FrameRenderer) {
        const toRerenderSpriteData = [];
        for (let i = 0; i < this._renderedSpriteDataList.length; i++) {
            const renderedSpriteData = this._renderedSpriteDataList[i];
            if (renderedSpriteData.renderedSprite.options.renderer === render) {
                toRerenderSpriteData.push(renderedSpriteData);
            }
        }
        this.renderSprites(toRerenderSpriteData);
    }

    /**
     * 获取下一个可用的Sprite
     * @returns 
     */
    private getNextTiledTextureSprite () {
        let sprite = this._sprites.find(geo => !geo.tiledTexture.isFull);
        if (!sprite) {
            const tiledTexture = new TiledTexture(this.size, this.tileSize);
            const bufferGeometry = this.createBufferGeometry();
            const instanceCount = tiledTexture.tilesCount;
            const mtl = new SpriteMaterial({
                sizeAttenuation: false,
                map: tiledTexture.texture,
                transparent: true,
                depthTest: false,
                //@ts-ignore
                onBeforeCompile: (shader: Shader, renderer: WebGLRenderer) => {
                    shader.vertexShader = SpriteShaderExt.extShader(shader);
                }
            });
            const mesh = new InstancedMesh(bufferGeometry, mtl, instanceCount);
            //初始化一下 matrix和color 不然会出问题(FPS降低)
            for (let i = 0; i < instanceCount; i++) {
                mesh.setMatrixAt(i, new Matrix4());
            }
            sprite = { tiledTexture: tiledTexture, geometry: bufferGeometry, material: mtl, mesh: mesh };
            this._sprites.push(sprite);
        }
        return sprite;
    }

    /**
     * 渲染指定的sprites
     * @param spriteDataList 
     */
    private renderSprites (spriteDataList: RenderedSpriteData[]) {
        for (let i = 0; i < spriteDataList.length; i++) {
            const spriteData = spriteDataList[i];
            const tiledSprite = this._sprites[spriteData.renderedSprite.spriteIndex];
            const tilingScheme = spriteData.renderedSprite.options.tilingScheme;
            const renderer = spriteData.renderedSprite.options.renderer;
            const mesh = tiledSprite.mesh;
            const factor = (2 * Math.tan(math.toRadian((renderer.camera as PerspectiveCamera).fov / 2)));
            const specSize = spriteData.renderedSprite.options.specSize;
            const showImageWidth = specSize ? specSize.width : tiledSprite.tiledTexture.tileSize;
            const showImageHeight = specSize ? specSize.height : tiledSprite.tiledTexture.tileSize;
            const xScale = showImageWidth * factor / renderer.size.height;
            const yScale = showImageHeight * factor / renderer.size.height;

            const renderData = {
                position: spriteData.renderedSprite.options.position,
                rotation: spriteData.renderedSprite.options.rotation,
                anchor: spriteData.renderedSprite.options.anchor,
                scale: spriteData.visible ? 1 : 0,
                uvRange: spriteData.renderedSprite.tiledTextureResult.uvRange,
            }

            const coord = Transform.cartographicToWorldVec3(renderData.position, tilingScheme);
            const scale = renderData.scale;

            const matrixIndex = spriteData.renderedSprite.tiledTextureResult.tileIndex;

            const matrix = SpriteShaderExt.createInstanceMatrix({
                position: coord,
                scale: new Vector2(xScale * scale * spriteData.renderedSprite.options.scale.widthScale, yScale * scale * spriteData.renderedSprite.options.scale.heihgtScale),
                rotation: renderData.rotation,
                uvRange: renderData.uvRange,
                anchor: renderData.anchor
            });
            mesh.setMatrixAt(matrixIndex, matrix);

            mesh.instanceMatrix.needsUpdate = true;
        }
    }

    /**
     * 创建bufferGeometry
     * @returns 
     */
    private createBufferGeometry () {
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

}