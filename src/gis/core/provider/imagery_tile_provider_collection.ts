import { GenericEvent } from "../../../core/event/generic_event";
import { Collection } from "../misc/collection";
import { IImageryTileProvider } from "./imagery_tile_provider";

export class ImageryTileProviderCollection extends Collection<IImageryTileProvider>{

    public readonly providerAdded: GenericEvent<IImageryTileProvider>;

    //当图层处于集合中的排序改变时触发
    public readonly providerMoved: GenericEvent<IImageryTileProvider>;

    public readonly providerRemoved: GenericEvent<IImageryTileProvider>;

    //图层显示或隐藏触发
    public readonly providerShownOrHidden = new GenericEvent<IImageryTileProvider>();

    public get size () {
        return this._collection.length;
    }

    constructor (imageryTileProviders?: IImageryTileProvider[]) {
        super(imageryTileProviders);
        this.providerAdded = this.eleAdded;
        this.providerMoved = this.eleMoved;
        this.providerRemoved = this.eleRemoved;
    }

    public add (provider: IImageryTileProvider, index?: number): boolean {
        const res = super.add(provider, index);
        if (res) {
            provider.visibilityChanged.addEventListener(this.onProviderVisibilityChanged, this);
        }
        return res;
    }


    /**
     * 移除瓦片提供者
     * @param provider 
     * @returns 
     */
    public remove (provider: IImageryTileProvider): boolean {
        const res = super.remove(provider);
        provider.visibilityChanged.removeEventListener(this.onProviderVisibilityChanged, this);
        return res;
    }

    /**
     * 移除所有瓦片提供者
     */
    public removeAll () {
        const items = [].concat(this._collection) as IImageryTileProvider[];
        super.removeAll();
        items.forEach(item => {
            item.visibilityChanged.removeEventListener(this.onProviderVisibilityChanged, this);
        });
    }

    private onProviderVisibilityChanged (provider: IImageryTileProvider) {
        this.providerShownOrHidden.invoke(provider);
    }

}