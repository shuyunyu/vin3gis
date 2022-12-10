import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { ImageryTileProviderCollection } from "../provider/imagery_tile_provider_collection";
import { QuadtreeTile } from "../scene/quad_tree_tile";
import { QuadtreeTileQueue } from "../scene/quad_tree_tile_queue";

/**
 * 瓦片提供者渲染管理对象
 */
export class TileImageryProviderRenderManager {

    public readonly imageryProviders: ImageryTileProviderCollection;

    private _baseImageryTileProvider: IImageryTileProvider;

    //最底层的ImageryTileProvider
    public get baseImageryTileProvider () {
        return this._baseImageryTileProvider;
    }

    //提供者渲染队列记录
    private _providerRenderQueueRecord: Record<string, QuadtreeTileQueue> = Object.create(null);

    public constructor (imageryProviderCollection: ImageryTileProviderCollection) {
        this.imageryProviders = imageryProviderCollection;
        this.initEventListeners();
    }

    //初始化事件监听
    private initEventListeners () {
        this.imageryProviders.providerAdded.addEventListener(this.onImageryTileProvderAdded, this);
        this.imageryProviders.providerMoved.addEventListener(this.onImageryTileProviderMoved, this);
        this.imageryProviders.providerRemoved.addEventListener(this.onImageryTileProviderRemoved, this);
        this.imageryProviders.providerShownOrHidden.addEventListener(this.onImageryTileProviderVisibilityChanged, this);
    }

    //移除事件监听
    private removeEventListener () {
        this.imageryProviders.providerAdded.removeEventListener(this.onImageryTileProvderAdded, this);
        this.imageryProviders.providerMoved.removeEventListener(this.onImageryTileProviderMoved, this);
        this.imageryProviders.providerRemoved.removeEventListener(this.onImageryTileProviderRemoved, this);
        this.imageryProviders.providerShownOrHidden.removeEventListener(this.onImageryTileProviderVisibilityChanged, this);
    }

    private onImageryTileProvderAdded (provider: IImageryTileProvider) {
        this._baseImageryTileProvider = this.imageryProviders.get(0);
        if (!this.getProviderRenderQueue(provider)) {
            this._providerRenderQueueRecord[provider.id] = new QuadtreeTileQueue();
        }
    }

    private onImageryTileProviderMoved (provider: IImageryTileProvider) {
        this._baseImageryTileProvider = this.imageryProviders.get(0);
    }

    private onImageryTileProviderRemoved (provider: IImageryTileProvider) {
        this._baseImageryTileProvider = this.imageryProviders.get(0);
        delete this._providerRenderQueueRecord[provider.id];
        this.recycleProviderTileImagery(provider);
    }

    private onImageryTileProviderVisibilityChanged (provider: IImageryTileProvider) {
        if (provider.visible) {
            this.markToRenderProviderTileImagery(provider);
        } else {
            this.recycleProviderTileImagery(provider);
        }
    }

    /**
     * 判断提供者是否是最底层的提供者
     * @param provider 
     * @returns 
     */
    public isBaseImageryTileProvider (provider: IImageryTileProvider) {
        return provider === this.baseImageryTileProvider;
    }

    /**
     * 获取provider的渲染队列
     * @param provider 
     * @returns 
     */
    public getProviderRenderQueue (provider: IImageryTileProvider) {
        return this._providerRenderQueueRecord[provider.id];
    }

    /**
     * 回收提供者渲染的瓦片
     * @param provider 
     */
    public recycleProviderTileImagery (provider: IImageryTileProvider) {
        const queue = this.getProviderRenderQueue(provider);
        if (!queue) return;
        queue.foreach((tile: QuadtreeTile, index: number) => {
            tile.data && tile.data.recyleTileImagery(provider);
        });
        queue.clear();
    }

    /**
     * 将provider标记为需要渲染瓦片
     * @param provider 
     */
    public markToRenderProviderTileImagery (provider: IImageryTileProvider) {
        if (this.baseImageryTileProvider) {
            const queue = this.getProviderRenderQueue(provider);
            queue.foreach((tile: QuadtreeTile, index: number) => {
                tile.data && tile.data.markToRerenderTileImagery();
            });
        }
    }

    public destroy () {
        this.removeEventListener();
    }

}

