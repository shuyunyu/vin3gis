import { Utils } from "../../../core/utils/utils";

export class DoubleLinkedListNode<T> {
    public item: T | undefined;

    public previous: DoubleLinkedListNode<T> | undefined;

    public next: DoubleLinkedListNode<T> | undefined;

    constructor (item: T, previous?: DoubleLinkedListNode<T>, next?: DoubleLinkedListNode<T>) {
        this.item = item;
        this.previous = previous;
        this.next = next;
    }
}

export class DoubleLinkedList<T> {

    private _head: DoubleLinkedListNode<T> | undefined;

    private _tail: DoubleLinkedListNode<T> | undefined;

    private _length: number;

    public get length () {
        return this._length;
    }

    public get head () {
        return this._head;
    }

    public get tail () {
        return this._tail;
    }

    constructor () {
        this._head = undefined;
        this._tail = undefined;
        this._length = 0;
    }

    /**
     * 添加元素至末尾
     * @param item 
     */
    public add (item?: T) {
        let node = new DoubleLinkedListNode(item, this._tail, undefined);
        if (Utils.defined(this._tail)) {
            //@ts-ignore
            this._tail!.next = node;
            //@ts-ignore
            this._tail = node;
        } else {
            //@ts-ignore
            this._head = node;
            //@ts-ignore
            this._tail = node;
        }

        ++this._length;

        return node;

    }

    private doRemove (list: DoubleLinkedList<T>, node: DoubleLinkedListNode<T>) {
        if (Utils.defined(node.previous) && Utils.defined(node.next)) {
            node.previous!.next = node.next;
            node.next!.previous = node.previous;
        } else if (Utils.defined(node.previous)) {
            // Remove last node
            node.previous!.next = undefined;
            list._tail = node.previous;
        } else if (Utils.defined(node.next)) {
            //Remove first node
            node.next!.previous = undefined;
            list._head = node.next;
        } else {
            // Remove last node in the linked list
            list._head = undefined;
            list._tail = undefined;
        }

        node.next = undefined;
        node.previous = undefined;
    }

    /**
     * 从列表中移除节点
     * @param node 
     */
    public remove (node: DoubleLinkedListNode<T>) {
        if (!Utils.defined(node)) {
            return;
        }
        this.doRemove(this, node);
        --this._length;

    }


    /**
     * 将nextNode移动到node之后
     * @param node 
     * @param nextNode 
     */
    public splice (node: DoubleLinkedListNode<T>, nextNode: DoubleLinkedListNode<T>) {
        if (node === nextNode) {
            return;
        }

        this.doRemove(this, nextNode);

        let oldNodeNext = node.next;
        node.next = nextNode;

        // nextNode is the new tail
        if (this._tail === node) {
            this._tail = nextNode;
        } else {
            oldNodeNext!.previous = nextNode;
        }

        nextNode.next = oldNodeNext;
        nextNode.previous = node;

    }


}