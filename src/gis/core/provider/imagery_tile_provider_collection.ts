import { GenericEvent } from "../../../core/event/generic_event";
import { Utils } from "../../../core/utils/utils";
import { IImageryTileProvider } from "./imagery_tile_provider";

export class ImageryTileProviderCollection {

    private _collection: IImageryTileProvider[] = [];

    public readonly providerAdded = new GenericEvent<IImageryTileProvider>();

    //当图层处于集合中的排序改变时触发
    public readonly providerMoved = new GenericEvent<IImageryTileProvider>();

    public readonly providerRemoved = new GenericEvent<IImageryTileProvider>();

    //图层显示或隐藏触发
    public readonly providerShownOrHidden = new GenericEvent<IImageryTileProvider>();

    public get size () {
        return this._collection.length;
    }

    constructor (imageryTileProviders?: IImageryTileProvider[]) {
        if (Utils.defined(imageryTileProviders)) {
            for (let i = 0; i < imageryTileProviders!.length; i++) {
                const provider = imageryTileProviders![i];
                this.add(provider);
            }
        }
    }

    public add (provider: IImageryTileProvider, index?: number): boolean {
        if (!this.contains(provider)) {
            if (Utils.defined(index) && index! >= 0 && index! < this._collection.length) {
                this._collection.splice(index!, 0, provider);
            } else {
                this._collection.push(provider);
            }
            provider.visibilityChanged.addEventListener(this.onProviderVisibilityChanged, this);
            this.providerAdded.invoke(provider);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 将瓦片提供者 放入集合最底下
     * @param provider 
     */
    public lowerToBottom (provider: IImageryTileProvider) {
        let index = this.indexOf(provider);
        if (index > -1) {
            this._collection.splice(index, 1);
            this._collection.unshift(provider);
        } else {
            this._collection.unshift(provider);
            this.providerAdded.invoke(provider);
        }
    }

    /**
     * 将瓦片提供者 移动到集合最上层
     * @param provider 
     */
    public raiseToTop (provider: IImageryTileProvider) {
        let index = this.indexOf(provider);
        if (index > -1) {
            this._collection.splice(index, 1);
            this._collection.push(provider);
        } else {
            this._collection.push(provider);
            this.providerAdded.invoke(provider);
        }
    }

    public get (index: number): IImageryTileProvider | undefined {
        return this._collection[index];
    }

    public contains (provider: IImageryTileProvider) {
        return this.indexOf(provider) > -1;
    }

    public indexOf (provider: IImageryTileProvider) {
        return this._collection.indexOf(provider);
    }

    /**
     * 移除瓦片提供者
     * @param provider 
     * @returns 
     */
    public remove (provider: IImageryTileProvider): boolean {
        let index = this.indexOf(provider);
        if (index > -1) {
            this._collection.splice(index, 1);
            provider.visibilityChanged.removeEventListener(this.onProviderVisibilityChanged, this);
            this.providerRemoved.invoke(provider);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 移除所有瓦片提供者
     */
    public removeAll () {
        while (this._collection.length) {
            let provider = this._collection.shift();
            provider?.visibilityChanged.removeEventListener(this.onProviderVisibilityChanged, this);
            this.providerRemoved.invoke(provider);
        }
    }

    public foreach (callback: (item: IImageryTileProvider, index: number) => any) {
        for (let i = 0; i < this._collection.length; i++) {
            const res = callback(this._collection[i], i);
            if (res === false) break;
        }
    }

    private onProviderVisibilityChanged (provider: IImageryTileProvider) {
        this.providerShownOrHidden.invoke(provider);
    }

}