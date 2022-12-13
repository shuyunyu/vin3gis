import { Box3, Sphere } from "three";
import { Utils } from "../../../core/utils/utils";
import { QuadtreeTileLoadState } from "../../@types/core/gis";
import { Rectangle } from "../geometry/rectangle";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { FrameState } from "./frame_state";
import { GlobeSurfaceTile } from "./globe_surface_tile";
import { TileBoundingRegion } from "./tile_bounding_region";

/**
 * 四叉树 瓦片
 */
export class QuadtreeTile {

    private _id: string;

    private _tilingScheme: ITilingScheme;

    private _parent?: QuadtreeTile;

    private _tileBoundingRegion: TileBoundingRegion;

    private _x: number = 0;

    private _y: number = 0;

    private _level: number = 0;

    //米制单位 矩形
    private _rectangle: Rectangle;

    //creator单位 矩形
    private _nativeRectangle: Rectangle;

    //包围盒
    private _aabb: Box3;

    //包围球
    private _shpere: Sphere;

    //到摄像机的距离
    private _distanceToCamera?: number;

    //数据下载优先级
    private _priority: number = 0;

    //瓦片状态
    private _state: QuadtreeTileLoadState;

    //标识 是否可用渲染
    private _renderable: boolean;

    private _southwestChild?: QuadtreeTile;
    private _souteastChild?: QuadtreeTile;
    private _northwestChild?: QuadtreeTile;
    private _northeastChild?: QuadtreeTile;

    public replacementPrevious?: QuadtreeTile;
    public replacementNext?: QuadtreeTile;

    private _data?: GlobeSurfaceTile;

    private _children: QuadtreeTile[];

    //瓦片 id
    public get id () {
        return this._id;
    }

    public get x () {
        return this._x;
    }

    public get y () {
        return this._y;
    }

    public get level () {
        return this._level;
    }

    public get state () {
        return this._state;
    }

    public set state (val: QuadtreeTileLoadState) {
        this._state = val;
    }

    public get parent () {
        return this._parent;
    }

    public get tileBoundingRegion () {
        return this._tileBoundingRegion;
    }

    public get tilingScheme () {
        return this._tilingScheme;
    }

    public get rectangle () {
        return this._rectangle;
    }

    public get nativeRectangle () {
        return this._nativeRectangle;
    }

    public get aabb () {
        return this._aabb;
    }

    public get shpere () {
        return this._shpere;
    }

    public get distanceToCamera () {
        return this._distanceToCamera;
    }

    /**
     * 是否可以卸载资源
     */
    public get eligibleForUnloading () {
        return !this._data || this._data.eligibleForUnloading;
    }

    public get priority () {
        return this._priority;
    }

    public set priority (val: number) {
        this._priority = val;
    }

    public get data () {
        return this._data;
    }

    public set data (val: GlobeSurfaceTile | undefined) {
        this._data = val;
    }

    public get renderable () {
        return this._renderable;
    }

    public set renderable (val: boolean) {
        this._renderable = val;
    }

    get children (): QuadtreeTile[] {
        if (!this._children) {
            this._children = [
                this.northwestChild,
                this.northeastChild,
                this.southwestChild,
                this.southeastChild
            ];
        }
        return this._children;
    }

    get southwestChild () {
        if (this._southwestChild) {
            return this._southwestChild;
        }
        this._southwestChild = new QuadtreeTile(this.tilingScheme, this.x * 2, this.y * 2 + 1, this.level + 1, this);
        return this._southwestChild;
    }

    get southeastChild () {
        if (this._souteastChild) {
            return this._souteastChild;
        }
        this._souteastChild = new QuadtreeTile(this.tilingScheme, this.x * 2 + 1, this.y * 2 + 1, this.level + 1, this);
        return this._souteastChild;
    }

    get northwestChild () {
        if (this._northwestChild) {
            return this._northwestChild;
        }
        this._northwestChild = new QuadtreeTile(this.tilingScheme, this.x * 2, this.y * 2, this.level + 1, this);
        return this._northwestChild;
    }

    get northeastChild () {
        if (this._northeastChild) {
            return this._northeastChild;
        }
        this._northeastChild = new QuadtreeTile(this.tilingScheme, this.x * 2 + 1, this.y * 2, this.level + 1, this);
        return this._northeastChild;
    }


    constructor (tilingScheme: ITilingScheme, x: number, y: number, level: number, parent?: QuadtreeTile,) {
        this._x = x;
        this._y = y;
        this._level = level;
        this._id = `tile_${this.x}_${this.y}_${this.level}`;
        this._state = QuadtreeTileLoadState.START;
        this._tilingScheme = tilingScheme;
        this._rectangle = this._tilingScheme.tileXYToRectangle(x, y, level);
        this._nativeRectangle = this._tilingScheme.tileXYToNativeRectangle(x, y, level);
        this._aabb = this._tilingScheme.tileXYToNativeAABB(x, y, level);
        this._shpere = this._tilingScheme.tileXYToNativeShpere(x, y, level);
        this._parent = parent;
        this._tileBoundingRegion = new TileBoundingRegion(this);
        this._renderable = false;
    }

    /**
     * 更新 瓦片到摄像机的距离
     */
    public updateDistanceToCamera (frameState: FrameState) {
        this._distanceToCamera = !frameState.cameraChanged && Utils.defined(this._distanceToCamera) ? this._distanceToCamera : this._tileBoundingRegion?.distanceToCamera(frameState);
    }

    /**
     * 判断是否需要加载数据
     */
    public get needsLoading () {
        return !this.data || this.data.needsLoading;
    }

    /**
     * 创建 level=0 的瓦片
     * @returns 
     */
    public static createLevelZeroTiles (tilingScheme: ITilingScheme): Array<QuadtreeTile> {
        let numberOfLevelZeroTilesX = tilingScheme.getNumberOfXTilesAtLevel(0);
        let numberOfLevelZeroTilesY = tilingScheme.getNumberOfYTilesAtLevel(0);
        let res = new Array<QuadtreeTile>(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);
        let index = 0;
        for (let y = 0; y < numberOfLevelZeroTilesY; ++y) {
            for (let x = 0; x < numberOfLevelZeroTilesX; ++x) {
                res[index++] = new QuadtreeTile(tilingScheme, x, y, 0);
            }
        }
        return res;
    }

    /**
     * 释放资源
     */
    freeResources () {
        this._state = QuadtreeTileLoadState.START;
        if (this._data) {
            this._data.releaseResource();
        }
        this._data = null;
        this._renderable = false;
        this._souteastChild?.freeResources();
        this._southwestChild?.freeResources();
        this._northeastChild?.freeResources();
        this._northwestChild?.freeResources();
        this._souteastChild = null;
        this._southwestChild = null;
        this._northwestChild = null;
        this._northeastChild = null;
        this._children = null;
    }

}
