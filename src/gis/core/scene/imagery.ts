import { Utils } from "../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskStatus } from "../../../core/xhr/scheduler/@types/request";
import { ImageRequestResult } from "../../@types/core/gis";
import { Log } from "../../log/log";
import { TileImageAssetProcessor } from "../asset/tile_image_asset_processor";
import { imageryCache } from "../cache/imagery_cache";
import { Rectangle } from "../geometry/rectangle";
import { IImageryTileProvider } from "../provider/imagery_tile_provider";
import { QuadtreeTile } from "./quad_tree_tile";

export enum ImageryState {
    UNLOAD = 0,
    LOADING,
    LOADED,
    FAILED
}

export class Imagery {

    private _imageryTileProvider: IImageryTileProvider;

    private _x: number;

    private _y: number;

    private _level: number;

    private _rectangle: Rectangle;

    private _priority: number;

    private _state: ImageryState;

    private _isValid: boolean;

    private _imageAsset?: ImageBitmap;

    private _tileImageAssetProcessor?: TileImageAssetProcessor;

    private _parent: Imagery | undefined;

    private _requestTask: IScheduleRequestTask | undefined;

    //引用数量
    private _referenceCount: number;

    public get state () {
        return this._state;
    }

    public get imageAsset () {
        return this._imageAsset;
    }

    public get parent () {
        return this._parent;
    }

    public get rectangle () {
        return this._rectangle;
    }

    public get isValid () {
        return this._isValid;
    }

    public set priority (val: number) {
        this._priority = val;
        //更新下载任务优先级
        if (Utils.defined(this._requestTask)) {
            this._requestTask!.priority = this._priority;
        }
    }

    constructor (tile: QuadtreeTile, imageryTileProvider: IImageryTileProvider) {
        this._x = tile.x;
        this._y = tile.y;
        this._level = tile.level;
        this._priority = tile.priority;
        this._rectangle = tile.nativeRectangle;
        this._state = ImageryState.UNLOAD;
        this._isValid = false;
        this._imageryTileProvider = imageryTileProvider;
        this._referenceCount = 0;
        this._parent = Utils.defined(tile.parent) ? imageryCache.getImagery(tile.parent!, imageryTileProvider) : undefined;
    }

    //添加引用
    public addReference () {
        this._referenceCount++;
    }

    //状态处理
    public processStateMachine () {
        if (this._state === ImageryState.UNLOAD) {
            this._state = ImageryState.LOADING;
            this._requestTask = this._imageryTileProvider.requestTileImageAsset(this._x, this._y, this._level, this._priority, (image: ImageRequestResult, state: RequestTaskStatus) => {
                if (state === RequestTaskStatus.ERROR) {
                    this._state = ImageryState.FAILED;
                    Log.error(Imagery, `request tile imagery asset failed: x:${this._x} y:${this._y} level:${this._level} provider:${this._imageryTileProvider.id}`);
                } else if (state === RequestTaskStatus.SUCCESS) {
                    this._tileImageAssetProcessor = new TileImageAssetProcessor(image);
                    this._tileImageAssetProcessor.process().then(imageAsset => {
                        this._tileImageAssetProcessor.dispose();
                        this._tileImageAssetProcessor = null;
                        this._imageAsset = imageAsset;
                        this._state = ImageryState.LOADED;
                        this._isValid = true;
                    }).catch(err => {
                        this._state = ImageryState.FAILED;
                    });
                } else if (state === RequestTaskStatus.ABORT) {
                    this._state = ImageryState.FAILED;
                }
                this._requestTask = undefined;
            });
        }
    }

    //释放资源
    public releaseResource () {
        this._referenceCount--;
        if (this._referenceCount > 0) {
            return;
        }
        imageryCache.removeImagery(this._x, this._y, this._level, this._imageryTileProvider);
        if (Utils.defined(this._parent)) {
            this._parent!.releaseResource();
        }
        if (Utils.defined(this._imageAsset)) {
            if (this._imageAsset instanceof ImageBitmap) {
                if (this._imageAsset.width) {
                    this._imageAsset.close();
                }
            }
        }
        if (this._requestTask) {
            this._requestTask.abort();
            this._requestTask = undefined;
        }
        if (this._tileImageAssetProcessor) {
            this._tileImageAssetProcessor.dispose();
            this._tileImageAssetProcessor = null;
        }
        this._imageAsset = undefined;
        this._state = ImageryState.UNLOAD;
        this._isValid = false;
    }

}