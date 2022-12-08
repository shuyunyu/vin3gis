import { Utils } from "../../../core/utils/utils";
import { QuadtreeTile } from "./quad_tree_tile";

export class QuadtreeTileQueue {

    private _queue: QuadtreeTile[] = [];

    /**
     * 入队
     * @param quadtreeTile 
     */
    public enqueue (quadtreeTile: QuadtreeTile) {
        this._queue.push(quadtreeTile);
    }

    /**
     * 出队
     * @param quadtreeTile 
     * @returns 
     */
    public dequeue (): QuadtreeTile | undefined {
        return this._queue.shift();
    }

    /**
     * 移除 某个瓦片
     * @param quadtreeTile 
     */
    public remove (quadtreeTile: QuadtreeTile): boolean {
        let index = this._queue.indexOf(quadtreeTile);
        this._queue.splice(index, 1);
        return index > -1;
    }

    /**
     * 获取队列大小
     * @returns 
     */
    public size (): number {
        return this._queue.length;
    }

    /**
     * 按距离排序
     * @param des 是否是降序排序 
     */
    public sortByDistanceToCamera (des: boolean) {
        this._queue.sort((tile1, tile2) => des ? tile2.distanceToCamera! - tile1.distanceToCamera! : tile1.distanceToCamera! - tile2.distanceToCamera!);
    }

    /**
     * 清除所有
     */
    public clearAll () {
        while (this._queue.length) {
            this._queue.pop();
        }
    }

    /**
     * 检查是否包含
     * @param quadtreeTile 
     * @returns 
     */
    public contains (quadtreeTile: QuadtreeTile) {
        return this._queue.indexOf(quadtreeTile) > -1;
    }

    /**
     * 求差集
     * @param quadtreeTiles 
     * @returns 
     */
    public difference (quadtreeTiles: QuadtreeTile[]) {
        return this._queue.filter(tile => quadtreeTiles.indexOf(tile) === -1);
    }

    public foreach (callback: (tile: QuadtreeTile, index: number) => boolean | any) {
        for (let i = 0; i < this._queue.length; i++) {
            const res = callback(this._queue[i], i);
            if (res === false) break;
        }
    }

    public toArray (out?: QuadtreeTile[]): QuadtreeTile[] {
        if (Utils.defined(out)) {
            for (let i = 0; i < this._queue.length; i++) {
                const tile = this._queue[i];
                out!.push(tile);
            }
            return out!;
        } else {
            return this._queue;
        }

    }

}