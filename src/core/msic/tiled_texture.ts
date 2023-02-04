import { Texture } from "three";
import { SystemDefines } from "../../@types/core/system/system";
import { RectangleRange } from "../../@types/global/global";
import { disposeSystem } from "../system/dispose_system";

export type TiledTextureResult = {
    texture: Texture;//所属贴图
    uvRange: RectangleRange;//在贴图中对应的uv范围
    tileIndex: number;//对应的瓦片索引
}

/**
 * 平铺(瓦片)贴图
 */
export class TiledTexture implements SystemDefines.Disposable {

    public readonly size: number;

    public readonly tileSize: number;

    private _texture: Texture;

    /**
     * 内部构建出来的texture
     */
    public get texture () {
        return this._texture;
    }

    private _canvas: HTMLCanvasElement;

    public get canvas () {
        return this._canvas;
    }

    private _ctx: CanvasRenderingContext2D;

    private _tiles: CanvasImageSource[];

    /**
     * 标识 该贴图是否是空的
     */
    public get isEmpty () {
        const tile = this._tiles.find(t => !!t);
        return !tile;
    }

    /**
     * 标识 该贴图的瓦片位置是否已经铺满了
     */
    public get isFull () {
        const emptyTile = this._tiles.find(t => !t);
        return !emptyTile;
    }

    /**
     * 构造函数
     * @param size 贴图尺寸
     * @param tileSize 瓦片贴图尺寸
     */
    public constructor (size: number = 1024, tileSize: number = 128) {
        this.size = size;
        this.tileSize = tileSize;
        this.init();
    }

    private init () {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.size;
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._texture = new Texture(canvas);

        const count = Math.pow(this.size / this.tileSize, 2);
        this._tiles = new Array(count).fill(null);

    }

    /**
     * 平铺图片到该帖图上
     * @param image 
     */
    public tileImage (image: CanvasImageSource): TiledTextureResult | null {
        const index = this.getNextEmptyTileIndex();
        if (index === -1) return null;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        this._tiles[index] = canvas;
        this.updateTileImage(index, canvas);
        const uvRange = this.calcUvRange(index);
        return { texture: this.texture, uvRange: uvRange, tileIndex: index };
    }

    /**
     * 计算指定索引的行列号
     * @param index 
     * @returns 
     */
    private calcTileRowColNum (index: number) {
        const count = this.size / this.tileSize;
        const col = index % count;
        const row = Math.floor(index / count);
        return { col: col, row: row };
    }

    /**
     * 更新指定索引位置的贴图
     * @param index 
     * @param canvas 
     */
    private updateTileImage (index: number, canvas: HTMLCanvasElement) {
        this.clearTileImage(index);
        const rowColNum = this.calcTileRowColNum(index);
        const left = this.tileSize * rowColNum.col;
        const top = this.tileSize * rowColNum.row;
        this._ctx.drawImage(canvas, left, top, this.tileSize, this.tileSize);
        //update texture
        this._texture.needsUpdate = true;
    }

    /**
     * 清除指定位置的瓦片贴图
     * @param index 
     */
    private clearTileImage (index: number) {
        const rowColNum = this.calcTileRowColNum(index);
        const left = this.tileSize * rowColNum.col;
        const top = this.tileSize * rowColNum.row;
        this._ctx.clearRect(left, top, this.tileSize, this.tileSize);
    }

    /**
     * 计算uv范围
     * @param index 
     */
    private calcUvRange (index: number): RectangleRange {
        const rowColNum = this.calcTileRowColNum(index);
        const col = rowColNum.col;
        const row = rowColNum.row;
        const d = this.tileSize / this.size;
        const xmin = Math.max(0, col * d);
        const xmax = Math.min(1, (col + 1) * d);
        const ymin = Math.max(0, 1 - (row + 1) * d);
        const ymax = Math.min(1, 1 - row * d);
        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
    }

    /**
     * 获取下一个可以平铺图片的索引
     * @returns 
     */
    private getNextEmptyTileIndex () {
        let index = -1;
        for (let i = 0; i < this._tiles.length; i++) {
            const tile = this._tiles[i];
            if (!tile) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * 释放指定位置的瓦片贴图
     * @param tileIndex 
     */
    public disposeTileImage (tileIndex: number) {
        const tile = this._tiles[tileIndex];
        if (tile) {
            this.clearTileImage(tileIndex);
            this._tiles[tileIndex] = null;
        }
    }

    public dispose () {
        if (this.isEmpty) {
            disposeSystem.disposeObj(this.texture);
            this._canvas = null;
            this._ctx = null;
        }
    }

}