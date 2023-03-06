import { Utils } from "../../../../core/utils/utils";
import { DoubleLinkedList, DoubleLinkedListNode } from "../../misc/double_linked_list";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";

export class Earth3DTilesetCache {

    private _list: DoubleLinkedList<Earth3DTile>;

    private _sentinel: DoubleLinkedListNode<Earth3DTile>;

    private _trimTiles: boolean;

    constructor () {
        // [head, sentinel) -> tiles that weren't selected this frame and may be removed from the cache
        // (sentinel, tail] -> tiles that were selected this frame
        this._list = new DoubleLinkedList<Earth3DTile>();
        //@ts-ignore
        this._sentinel = this._list.add();
        this._trimTiles = false;
    }

    public reset () {
        // Move sentinel node to the tail so, at the start of the frame, all tiles
        // may be potentially replaced.  Tiles are moved to the right of the sentinel
        // when they are selected so they will not be replaced.
        this._list.splice(this._list.tail!, this._sentinel);
    }

    public touch (tile: Earth3DTile) {
        let node = tile.cacheNode;
        if (Utils.defined(node)) {
            this._list.splice(this._sentinel, node!);
        }
    }

    public add (tile: Earth3DTile) {
        if (!Utils.defined(tile.cacheNode)) {
            //@ts-ignore
            tile.cacheNode = this._list.add(tile);
        }
    }

    public unloadTile (tileset: Earth3DTileset, tile: Earth3DTile, unloadCallback: Function) {
        let node = tile.cacheNode;
        if (!Utils.defined(node)) {
            return;
        }
        this._list.remove(node!);
        tile.cacheNode = undefined;
        unloadCallback(tileset, tile);
    }

    public unloadTiles (tileset: Earth3DTileset, unloadCallback: Function) {
        let trimTiles = this._trimTiles;
        this._trimTiles = false;
        let list = this._list;
        // Traverse the list only to the sentinel since tiles/nodes to the
        // right of the sentinel were used this frame.
        //
        // The sub-list to the left of the sentinel is ordered from LRU to MRU.
        let sentinel = this._sentinel;
        let node = list.head;

        while (node !== sentinel && (tileset.memoryOutRange || trimTiles)) {
            let tile = node!.item;
            node = node!.next;
            this.unloadTile(tileset, tile!, unloadCallback);
        }
    }

    public trim () {
        this._trimTiles = true;
    }

}