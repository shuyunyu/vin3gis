import { Utils } from "../../../core/utils/utils";
import { QuadtreeTile } from "./quad_tree_tile";

export class TileReplacementQueue {

    private _head: QuadtreeTile | undefined;

    private _tail: QuadtreeTile | undefined;

    private _count: number = 0;

    private _lastBeforeStartOfFrame: QuadtreeTile | undefined;

    public get head () {
        return this._head;
    }

    public set head (val: QuadtreeTile | undefined) {
        this._head = val;
    }

    public get tail () {
        return this._tail;
    }

    public set tail (val: QuadtreeTile | undefined) {
        this._tail = val;
    }

    public get count () {
        return this._count;
    }

    public set count (val: number) {
        this._count = val;
    }

    constructor () {
    }

    public markStartOfRenderFrame () {
        this._lastBeforeStartOfFrame = this._head;
    }

    private remove (tileReplacementQueue: TileReplacementQueue, item: QuadtreeTile) {
        let previous = item.replacementPrevious;
        let next = item.replacementNext;

        if (item === tileReplacementQueue._lastBeforeStartOfFrame) {
            tileReplacementQueue._lastBeforeStartOfFrame = next;
        }

        if (item === tileReplacementQueue.head) {
            tileReplacementQueue._head = next;
        } else {
            previous!.replacementNext = next;
        }

        if (item === tileReplacementQueue.tail) {
            tileReplacementQueue._tail = previous;
        } else {
            next!.replacementPrevious = previous;
        }

        item.replacementPrevious = undefined;
        item.replacementNext = undefined;

        --tileReplacementQueue._count;
    }

    /**
     * Reduces the size of the queue to a specified size by unloading the least-recently used
     * tiles.  Tiles that were used last frame will not be unloaded, even if that puts the number
     * of tiles above the specified maximum.
     * @param maximumTiles 
     */
    public trimTiles (maximumTiles: number) {
        let tileToTrim = this.tail;
        let keepTrimming = true;
        while (
            keepTrimming &&
            Utils.defined(this._lastBeforeStartOfFrame) &&
            this.count > maximumTiles &&
            Utils.defined(tileToTrim)
        ) {
            // Stop trimming after we process the last tile not used in the
            // current frame.
            keepTrimming = tileToTrim !== this._lastBeforeStartOfFrame;

            let previous = tileToTrim!.replacementPrevious;

            if (tileToTrim!.eligibleForUnloading) {
                tileToTrim!.freeResources();
                this.remove(this, tileToTrim!);
            }

            tileToTrim = previous;
        }
    }

    /**
     * Marks a tile as rendered this frame and moves it before the first tile that was not rendered this frame.
     * @param item 
     * @returns 
     */
    public markTileRendered (item: QuadtreeTile) {
        let head = this._head;
        if (head === item) {
            if (item === this._lastBeforeStartOfFrame) {
                this._lastBeforeStartOfFrame = item.replacementNext;
            }
            return;
        }
        ++this._count;
        if (!Utils.defined(head)) {
            // no other tiles in the list
            item.replacementPrevious = undefined;
            item.replacementNext = undefined;
            this._head = item;
            this._tail = item;
            return;
        }
        if (Utils.defined(item.replacementPrevious) || Utils.defined(item.replacementNext)) {
            // tile already in the list, remove from its current location
            this.remove(this, item);
        }
        item.replacementPrevious = undefined;
        item.replacementNext = head;
        head!.replacementPrevious = item;
        this._head = item;
    }

}