import { Euler, Material, Matrix3, Matrix4, Mesh, Vector3 } from "three";
import { AssetLoader } from "../../../../core/asset/asset_loader";
import { MatConstants } from "../../../../core/constants/mat_constants";
import { math } from "../../../../core/math/math";
import { disposeSystem } from "../../../../core/system/dispose_system";
import { Utils } from "../../../../core/utils/utils";
import { IScheduleRequestTask, RequestTaskResult, RequestTaskStatus } from "../../../../core/xhr/scheduler/@types/request";
import { Earth3DTileContentState, Earth3DTileOptimizationHint, Earth3DTileOptions, Earth3DTileRefine, Earth3DTilesetGltfUpAxis, has3DTilesExtension } from "../../../@types/core/earth_3dtileset";
import { BoundingSphereUtils } from "../../../utils/bounding_sphere_utils";
import { Matrix3Utils } from "../../../utils/matrix3_utils";
import { Matrix4Utils } from "../../../utils/matrix4_utils";
import { Cartesian3 } from "../../cartesian/cartesian3";
import { Cartographic } from "../../cartographic";
import { InternalConfig } from "../../internal/internal_config";
import { DoubleLinkedListNode } from "../../misc/double_linked_list";
import { EARTH_3DTILE_BOUNDING_VOLUME_RENDER_ORDER } from "../../misc/render_order";
import { Transform } from "../../transform/transform";
import { BoundingOrientedBoxVolume } from "../bounding_oriented_box_volume";
import { BoundingRegionVolume } from "../bounding_region_volume";
import { BoundingSphereVolume } from "../bounding_sphere_volume";
import { IBoundingVolume } from "../bounding_volume";
import { FrameState } from "../frame_state";
import { Earth3DTileset } from "./earth_3dtileset";
import { IEarth3DTileContent } from "./earth_3dtile_content";
import { Earth3DTileContentFactory } from "./earth_3dtile_content_factory";
import { Earth3DTileContentType } from "./earth_3dtile_content_type";
import { EarthEmpty3DTileContent } from "./earth_empty_3dtile_content";
import { preprocess3DTileContent } from "./preprocess_3dtile_content";

const scratchTransform = new Matrix4();
const scratchToTileCenter = new Vector3();
const scratchCartesian = new Cartesian3();
const scratchScale = new Cartesian3();

const scratchMatrix = new Matrix3();
const scratchWorldCartesian3 = new Cartesian3();

export class Earth3DTile {

    private _id: string;

    //边界体
    private _boundingVolume: IBoundingVolume;

    private _boundingVolumeMesh: Mesh;

    private _boundingVolumeMaterial: Material;

    //content的边界体
    private _contentBoundingVolume?: IBoundingVolume;

    //查看用的边界体
    private _viewerRequestVolume?: IBoundingVolume;

    //子节点
    private _children: Earth3DTile[] = [];

    //内容
    private _content?: IEarth3DTileContent;

    //指示3dtile及其子节点是否可以显示的 空间误差  单位米
    private _geometricError: number;

    //所属的3dtileset
    private _tileset: Earth3DTileset;

    //父级tileset
    private _parent?: Earth3DTile;

    //tile的json描述
    private _header: any;

    //当前tile的变换矩阵
    private _transform: Matrix4;

    //计算完毕的转换矩阵
    private _computedTransform: Matrix4;

    //初始变换矩阵
    private _initialTransform: Matrix4;

    //替换类型
    private _refine: Earth3DTileRefine;

    private _refines: boolean = false;

    //表示 瓦片深度
    private _depth: number = 0;

    //表示 是否有多个content
    private _hasMultipleContents: boolean = false;

    //表示 是否有空的content
    private _hasEmptyContent: boolean = false;

    //表示 是否有tileset content
    private _hasTilesetContent: boolean = false;

    private _hasImplicitContent: boolean = false;

    //content状态
    private _contentState: Earth3DTileContentState;

    //content准备完毕的promise
    public _contentReadyPromise: Promise<boolean>;

    private _contentReadyPromise_resolve: Function | undefined;

    private _contentReadyPromise_reject: Function | undefined;

    //tile距离摄像机的距离
    private _distanceToCamera: number = 0.0;

    //表示 是否在请求体内
    private _inRequestVolume: boolean = false;

    //瓦片中心到摄像机的距离
    private _centerZDepth: number = 0.0;

    //屏幕空间误差
    private _screenSpaceError: number = 0.0;

    //跟踪瓦片的请求是否应该延迟到所有未延迟的请求
    private _priorityDeferred: boolean = false;

    //The screen space error at a given screen height of tileset.progressiveResolutionHeightFraction * screenHeight
    private _screenSpaceErrorProgressiveResolution: number = 0.0;

    private _priorityReverseScreenSpaceError: number = 0.0;

    private _priorityProgressiveResolution: boolean = false;

    private _priorityProgressiveResolutionScreenSpaceErrorLeaf: boolean = false;

    //可见性
    private _visible: boolean = false;

    //加载优先级
    private _priority: number = 0.0;

    private _foveatedFactor: number = 0.0;

    private _updatedVisibilityFrame: number = 0;

    private _optimChildrenWithinParent: Earth3DTileOptimizationHint = Earth3DTileOptimizationHint.NOT_COMPUTED;

    private _priorityHolder: Earth3DTile;

    // Needed for knowing when to continue a refinement chain. Gets reset in updateTile in traversal and gets set in updateAndPushChildren in traversal.
    private _wasMinPriorityChild: boolean = false;

    private _shouldSelect: boolean = false;

    private _finalResolution: boolean = true;

    //有content的祖先
    private _ancestorWithContent?: Earth3DTile;

    //content存在的祖先
    private _ancestorWithContentAvailable?: Earth3DTile;

    //The node in the tileset's LRU cache, used to determine when to unload a tile's content.
    private _cacheNode?: DoubleLinkedListNode<Earth3DTile>;

    private _expiredContent?: IEarth3DTileContent;

    //资源路径
    private _resourceUri?: string;

    //tileset 资源路径
    private _tilesetResourceUri?: string;

    private _boundingVolume2D?: IBoundingVolume;

    private _contentBoundingVolume2D?: IBoundingVolume;

    //请求瓦片的帧数
    private _requestedFrame: number = -1;

    private _touchedFrame: number = -1;

    private _visitedFrame: number = -1;

    private _selectedFrame: number = -1;

    private _lastStyleTime: number = 0;

    private _stackLength: number = 0;

    private _selectionDepth: number = 0;

    private _requestTask: IScheduleRequestTask;

    public get id () {
        return this._id;
    }

    public get selectionDepth () {
        return this._selectionDepth;
    }

    public get resourceUri () {
        return this._resourceUri;
    }

    public get tilesetRecourceUri () {
        return this._tilesetResourceUri;
    }

    public set selectionDepth (selectionDepth: number) {
        this._selectionDepth = selectionDepth;
    }

    public get stackLength () {
        return this._stackLength;
    }

    public set stackLength (stackLength: number) {
        this._stackLength = stackLength;
    }

    public get lastStyleTime () {
        return this._lastStyleTime;
    }

    public set lastStyleTime (lastStyleTime: number) {
        this._lastStyleTime = lastStyleTime;
    }

    public get selectedFrame () {
        return this._selectedFrame;
    }

    public set selectedFrame (selectedFrame: number) {
        this._selectedFrame = selectedFrame;
    }

    public get visitedFrame () {
        return this._visitedFrame;
    }

    public set visitedFrame (visitedFrame: number) {
        this._visitedFrame = visitedFrame;
    }

    public get touchedFrame () {
        return this._touchedFrame;
    }

    public set touchedFrame (touchedFrame: number) {
        this._touchedFrame = touchedFrame;
    }

    public get cacheNode () {
        return this._cacheNode;
    }

    public set cacheNode (cacheNode: DoubleLinkedListNode<Earth3DTile> | undefined) {
        this._cacheNode = cacheNode;
    }

    public get requestedFrame () {
        return this._requestedFrame;
    }

    public set requestedFrame (requestedFrame: number) {
        this._requestedFrame = requestedFrame;
    }

    public get ancestorWithContent () {
        return this._ancestorWithContent;
    }

    public set ancestorWithContent (ancestorWithContent: Earth3DTile | undefined) {
        this._ancestorWithContent = ancestorWithContent;
    }

    public set ancestorWithContentAvailable (ancestorWithContentAvailable: Earth3DTile | undefined) {
        this._ancestorWithContentAvailable = ancestorWithContentAvailable;
    }

    public get ancestorWithContentAvailable () {
        return this._ancestorWithContentAvailable;
    }

    public get distanceToCamera () {
        return this._distanceToCamera;
    }

    public set distanceToCamera (distanceToCamera: number) {
        this._distanceToCamera = distanceToCamera;
    }

    public get finalResolution () {
        return this._finalResolution;
    }

    public set finalResolution (finalResolution: boolean) {
        this._finalResolution = finalResolution;
    }

    public get shouldSelect () {
        return this._shouldSelect;
    }

    public set shouldSelect (shouldSelect: boolean) {
        this._shouldSelect = shouldSelect;
    }

    public get wasMinPriorityChild () {
        return this._wasMinPriorityChild;
    }

    public set wasMinPriorityChild (wasMinPriorityChild: boolean) {
        this._wasMinPriorityChild = wasMinPriorityChild;
    }

    public get priorityHolder () {
        return this._priorityHolder;
    }

    public set priorityHolder (priorityHolder: Earth3DTile) {
        this._priorityHolder = priorityHolder;
    }

    public get visible () {
        return this._visible;
    }

    public set visible (visible: boolean) {
        this._visible = visible;
    }

    public get optimChildrenWithinParent () {
        return this._optimChildrenWithinParent;
    }

    public get priorityProgressiveResolutionScreenSpaceErrorLeaf () {
        return this._priorityProgressiveResolutionScreenSpaceErrorLeaf;
    }

    public get priority () {
        return this._priority;
    }

    public get foveatedFactor () {
        return this._foveatedFactor;
    }

    public set foveatedFactor (foveatedFactor: number) {
        this._foveatedFactor = foveatedFactor;
    }

    public get priorityDeferred () {
        return this._priorityDeferred;
    }

    public get screenSpaceError () {
        return this._screenSpaceError;
    }

    public get screenSpaceErrorProgressiveResolution () {
        return this._screenSpaceErrorProgressiveResolution;
    }

    public get priorityReverseScreenSpaceError () {
        return this._priorityReverseScreenSpaceError;
    }

    public get contentReadyPromise () {
        return this._contentReadyPromise;
    }


    public get boundingVolume () {
        return this._boundingVolume;
    }

    public get boundingSphere () {
        return this._boundingVolume.boundingSphere;
    }

    public get contentBoundingVolume (): IBoundingVolume {
        return Utils.defaultValue(this._contentBoundingVolume, this.boundingVolume);
    }

    public get contentContentBoundingVolume2D () {
        return this._contentBoundingVolume2D;
    }

    public get viewerRequestVolume () {
        return this._viewerRequestVolume;
    }

    public get children () {
        return this._children;
    }

    public get content () {
        return this._content;
    }

    public get geometricError () {
        return this._geometricError;
    }

    public get parent () {
        return this._parent;
    }

    public get tileset () {
        return this._tileset;
    }

    public get computedTransform () {
        return this._computedTransform;
    }

    public get initialTransform () {
        return this._initialTransform;
    }

    public get header () {
        return this._header;
    }

    public get refine () {
        return this._refine;
    }

    public get refines () {
        return this._refines;
    }

    public set refines (refines: boolean) {
        this._refines = refines;
    }

    public get depth () {
        return this._depth;
    }

    public set depth (depth: number) {
        this._depth = depth;
    }

    public get hasMultipleContents () {
        return this._hasMultipleContents;
    }

    public get hasEmptyContent () {
        return this._hasEmptyContent;
    }

    public get hasTilesetContent () {
        return this._hasTilesetContent;
    }

    public get hasImplicitContent () {
        return this._hasImplicitContent;
    }

    public get contentState () {
        return this._contentState;
    }

    public get contentAvailable () {
        return (this.contentReady && !this.hasEmptyContent && !this.hasTilesetContent && !this.hasImplicitContent) || (Utils.defined(this._expiredContent) && !this.contentFailed);
    }

    public get inRequestVolume () {
        return this._inRequestVolume;
    }

    public get centerZDepth () {
        return this._centerZDepth;
    }

    //content是否准备好了
    public get contentReady () {
        return this._contentState === Earth3DTileContentState.READY;
    }

    //content是否还未加载
    public get contentUnloaded () {
        return this._contentState === Earth3DTileContentState.UNLOADED;
    }

    //content加载失败
    public get contentFailed () {
        return this._contentState === Earth3DTileContentState.FAILED;
    }

    //content过期
    public get contentExpired () {
        return this._contentState === Earth3DTileContentState.EXPIRED;
    }

    public get updatedVisibilityFrame () {
        return this._updatedVisibilityFrame;
    }

    public set updatedVisibilityFrame (updatedVisibilityFrame: number) {
        this._updatedVisibilityFrame = updatedVisibilityFrame;
    }

    constructor (options: Earth3DTileOptions) {
        this._id = Utils.createGuid();
        this._contentReadyPromise = this.createContentReadyPromise();
        this._tileset = options.tileset;
        this._tilesetResourceUri = Utils.defined(options.tilesetResourceUri) ? options.tilesetResourceUri : Utils.defined(this._parent) ? this._parent.tilesetRecourceUri : "";
        this._header = Utils.defaultValue(options.header, {});
        this._parent = options.parent;
        let contentHeader = options.header.content;
        this._transform = Utils.defined(options.header.transform) ? new Matrix4().fromArray(options.header.transform, 0) : MatConstants.Mat4_IDENTITY.clone();
        let parentTransform = Utils.defined(this._parent) ? this._parent.computedTransform : this._tileset.modelMatrix;
        let computedTransform = new Matrix4().copy(this._transform).premultiply(parentTransform);
        this._computedTransform = computedTransform;
        let parentInitialTransform = Utils.defined(this._parent) ? this._parent.initialTransform : MatConstants.Mat4_IDENTITY;
        this._initialTransform = new Matrix4().copy(parentInitialTransform).multiply(this._transform);

        this._boundingVolume = this.createBoundingVolume(options.header.boundingVolume, computedTransform);

        if (Utils.defined(contentHeader) && Utils.defined(contentHeader.boundingVolume)) {
            this._contentBoundingVolume = this.createBoundingVolume(contentHeader.boundingVolume, computedTransform);
        }

        if (Utils.defined(this.header.viewerRequestVolume)) {
            this._viewerRequestVolume = this.createBoundingVolume(this.header.viewerRequestVolume, this._computedTransform);
        }

        this._geometricError = this.header.geometricError;
        if (!Utils.defined(this._geometricError)) {
            this._geometricError = Utils.defined(this._parent) ? this._parent!.geometricError : this.tileset.geometricError;
        }

        this.updateGeometricErrorScale();

        if (Utils.defined(options.header.refine)) {
            this._refine = options.header.refine.toUpperCase() === "REPLACE" ? Earth3DTileRefine.REPLACE : Earth3DTileRefine.ADD;
        } else if (Utils.defined(this._parent)) {
            this._refine = this._parent!.refine;
        } else {
            this._refine = Earth3DTileRefine.REPLACE;
        }
        if (has3DTilesExtension(this._header, "3DTILES_multiple_contents")) {
            this._hasMultipleContents = true;
            this._contentState = Earth3DTileContentState.UNLOADED;
            //TODO 解析多个 content
        } else if (Utils.defined(contentHeader)) {
            let contentHeaderUri = contentHeader.uri || contentHeader.url;
            if (Utils.defined(contentHeader.url)) {
                console.warn('This tileset JSON uses the "content.url" property which has been deprecated. Use "content.uri" instead.');
            }
            this._contentState = Earth3DTileContentState.UNLOADED;
            this._resourceUri = contentHeaderUri;
        } else {
            this._content = new EarthEmpty3DTileContent(this._tileset, this);
            this._hasEmptyContent = true;
            this._contentState = Earth3DTileContentState.READY;
        }
        this._priorityHolder = this;
    }

    /**
     * 计算 摄像机到瓦片的距离(米)
     * @param frameState 
     */
    public distanceToTile (frameState: FrameState) {
        let boundingVolume = this.getBoundingVolume();
        return boundingVolume!.distanceToCamera(frameState);
    }

    /**
     * 计算 摄像机到瓦片中心点的距离(米)
     * @param frameState 
     */
    public distanceToTileCenter (frameState: FrameState) {
        let boundingVolume = this.getBoundingVolume();
        let metersPerUnit = Transform.getMetersPerUnit();
        let cameraWC = frameState.cameraWorldRTS.position;
        let toCenter = Cartesian3.subtract(scratchToTileCenter, boundingVolume!.boundingSphereCenter, cameraWC);
        return Cartesian3.dot(frameState.cameraDirection, toCenter) * metersPerUnit;
    }

    public getBoundingVolume () {
        if (!Utils.defined(this._boundingVolume2D)) {
            this._boundingVolume2D = BoundingSphereUtils.project2D(this.tileset.tilingScheme, this.tileset.coordinateOffsetType, this.boundingVolume.boundingSphereRadius, this.boundingVolume.boundingSphereCenter);;
        }
        return this._boundingVolume2D!;
    }

    private getContentBoundingVolume () {
        if (!Utils.defined(this._contentBoundingVolume2D)) {
            this._contentBoundingVolume2D = BoundingSphereUtils.project2D(this.tileset.tilingScheme, this.tileset.coordinateOffsetType, this.contentBoundingVolume.boundingSphereRadius, this.contentBoundingVolume.boundingSphereCenter);
        }
        return this._contentBoundingVolume2D!;
    }

    /**
     * 判断content的可见性
     * @param frameState 
     */
    public contentVisibility (frameState: FrameState) {
        if (!Utils.defined(this.contentBoundingVolume)) {
            return true;
        }
        let boundingVolume = this.getContentBoundingVolume();
        return boundingVolume.computeVisible(frameState);
    }

    /**
     * 获取tile的屏幕空间误差
     * @param frameState 帧状态
     * @param useParentGeometricError 是否使用父级几何误差
     * @param progressiveResolutionHeightFraction 
     */
    public getScreenSpaceError (frameState: FrameState, useParentGeometricError: boolean, progressiveResolutionHeightFraction?: number) {
        let tileset = this._tileset;
        let heightFraction = Utils.defaultValue(progressiveResolutionHeightFraction, 1.0);
        let parentGeometricError = Utils.defined(this.parent) ? this.parent!.geometricError : tileset.geometricError;
        let geometricError = useParentGeometricError ? parentGeometricError : this.geometricError;
        if (geometricError === 0.0) {
            // Leaf tiles do not have any error so save the computation
            return 0.0;
        }
        // let height = frameState.canvasSize.height * heightFraction;
        let height = frameState.drawContextHeihgt * heightFraction;
        //避免除以0
        let distance = Math.max(this._distanceToCamera, math.EPSILON7);
        let sseDenominator = frameState.sseDenominator;
        return (geometricError * height) / (distance * sseDenominator);
    }

    private createContentReadyPromise () {
        return new Promise<boolean>((resolve, reject) => {
            this._contentReadyPromise_resolve = resolve;
            this._contentReadyPromise_reject = reject;
        });
    }


    /**
     * 更新瓦片的可见性
     * @param frameState 
     */
    public updateVisibility (frameState: FrameState) {
        let parent = this._parent;
        let tileset = this._tileset;
        let parentTransform = Utils.defined(parent) ? parent.computedTransform : tileset.modelMatrix;
        this.updateTransform(parentTransform);
        this._distanceToCamera = this.distanceToTile(frameState);
        this._centerZDepth = this.distanceToTileCenter(frameState);
        this._screenSpaceError = this.getScreenSpaceError(frameState, false);
        this._screenSpaceErrorProgressiveResolution = this.getScreenSpaceError(frameState, false, tileset.progressiveResolutionHeightFraction);
        let boundingVolume = this.getBoundingVolume();
        this._visible = boundingVolume.computeVisible(frameState);
        this._inRequestVolume = this.insideViewerRequestVolume(frameState);
        this._priorityReverseScreenSpaceError = this.getPriorityReverseScreenSpaceError(tileset, this);
        this._priorityProgressiveResolution = this.isPriorityProgressiveResolution(tileset, this);
        this._priorityDeferred = this.isPriorityDeferred(this, frameState);
    }

    /**
     * 更新变换
     * @param transform 
     */
    public updateTransform (parentTransform?: Matrix4) {
        parentTransform = Utils.defaultValue(parentTransform, MatConstants.Mat4_IDENTITY);
        let computedTransform = scratchTransform.copy(parentTransform).multiply(this._transform);
        let transformChanged = !computedTransform.equals(this._computedTransform);
        if (!transformChanged) {
            return;
        }
        this._computedTransform.copy(computedTransform);
        // Update the bounding volumes
        let header = this._header;
        let content = this._header.content;
        this._boundingVolume = this.createBoundingVolume(header.boundingVolume, this._computedTransform, this._boundingVolume);
        if (Utils.defined(this._contentBoundingVolume)) {
            this._contentBoundingVolume = this.createBoundingVolume(content.boundingVolume, this._computedTransform, this._contentBoundingVolume);
        }
        if (Utils.defined(this._viewerRequestVolume)) {
            this._viewerRequestVolume = this.createBoundingVolume(header.viewerRequestVolume, this._computedTransform, this._viewerRequestVolume);
        }

        this.updateGeometricErrorScale();
    }

    /**
     * 更新几何误差
     * @returns 
     */
    private updateGeometricErrorScale () {
        if (!Utils.defined(this._geometricError)) return;
        let scale = Matrix4Utils.getScale(this._computedTransform, scratchScale);
        let uniformScale = scale.max();
        this._geometricError = this._geometricError * uniformScale;
    }

    /**
     * 创建边界体
     */
    public createBoundingVolume (boundingVolumeHeader: any, transform: Matrix4, out?: IBoundingVolume): IBoundingVolume {
        //TODO 根据gltf的轴向 创建BoundingVolume
        if (!Utils.defined(boundingVolumeHeader)) {
            throw new Error("boundingVolume must be defined.");
        }
        if (Utils.defined(boundingVolumeHeader.sphere)) {
            return this.createSphere(boundingVolumeHeader.sphere, transform, out);
        } else if (Utils.defined(boundingVolumeHeader.box)) {
            return this.createBox(boundingVolumeHeader.box, transform, out);
        } else if (Utils.defined(boundingVolumeHeader.region)) {
            return this.createRegion(boundingVolumeHeader.region, out);
        } else {
            throw new Error("boundingVolume must contain a sphere, region, or box.");
        }
    }

    /**
     * 创建边界范围
     * @param region 
     * @param transform 
     * @param initialTransform 
     * @param out 
     */
    private createRegion (region: any, out?: IBoundingVolume): IBoundingVolume {
        let southWest = new Cartographic(Number(region[0]), Number(region[1]), 0);
        let northEast = new Cartographic(Number(region[2]), Number(region[3]), 0);
        let minimumHeight = Number(region[4]);
        let maximumHeight = Number(region[5]);
        if (Utils.defined(out) && out instanceof BoundingRegionVolume) {
            out.update(southWest, northEast, minimumHeight, maximumHeight, this.tileset.coordinateOffsetType);
            return out;
        }
        return new BoundingRegionVolume(southWest, northEast, minimumHeight, maximumHeight, this.tileset.coordinateOffsetType);
    }


    /**
     * 创建边界盒
     * @param box 
     * @param transform 
     * @param out 
     */
    private createBox (box: any, transform: Matrix4, out?: IBoundingVolume): IBoundingVolume {
        let center = new Cartesian3(Number(box[0]), Number(box[1]), Number(box[2]));
        let halfAxes = new Matrix3().fromArray(box, 3);
        center = Matrix4Utils.multiplyByPoint(transform, center, center);
        const scale = Transform.getMetersScale();
        scratchTransform.makeScale(scale.x, scale.y, scale.z);
        scratchTransform.premultiply(transform);
        let rotationScale = scratchMatrix.setFromMatrix4(scratchTransform);
        halfAxes.premultiply(rotationScale);
        if (this._tileset.gltfUpAxis === Earth3DTilesetGltfUpAxis.Z) {
            const rotMat = Matrix3Utils.fromRotationX(-math.PI_OVER_TWO, new Matrix3());
            halfAxes.premultiply(rotMat);
        }
        if (Utils.defined(out) && out instanceof BoundingOrientedBoxVolume) {
            out.update(center, halfAxes, this.tileset.coordinateOffsetType);
            return out;
        }
        return new BoundingOrientedBoxVolume(center, halfAxes, this.tileset.coordinateOffsetType);
    }


    /**
     * 创建边界球
     */
    private createSphere (sphere: any, transform: Matrix4, out?: IBoundingVolume): IBoundingVolume {
        let x = Number(sphere[0]);
        let y = Number(sphere[1]);
        let z = Number(sphere[2]);
        let radius = Number(sphere[3]);
        let center = new Cartesian3(x, y, z);

        //计算变换后的中心点
        center = Matrix4Utils.multiplyByPoint(transform, center, center);
        let scale = Matrix4Utils.getScale(transform, center);
        let uniformScale = scale.max();
        radius *= uniformScale;
        if (Utils.defined(out) && out instanceof BoundingSphereVolume) {
            out.update(center, radius, this.tileset.coordinateOffsetType);
            return out;
        }
        return new BoundingSphereVolume(center, radius, this.tileset.coordinateOffsetType);
    }

    /**
     * 判断瓦片是否在 requestVolume中
     * @param frameState 
     */
    private insideViewerRequestVolume (frameState: FrameState) {
        let viewerRequestVolume = this._viewerRequestVolume;
        return !Utils.defined(viewerRequestVolume) || viewerRequestVolume!.distanceToCamera(frameState) === 0.0;
    }

    /**
     * 获取优先级反转的屏幕空间误差
     * @param tileset 
     * @param tile 
     * @returns 
     */
    private getPriorityReverseScreenSpaceError (tileset: Earth3DTileset, tile: Earth3DTile) {
        let parent = this.parent;
        let useParentScreenSpaceError = Utils.defined(parent) && (!tileset.skipLevelOfDetail || tile.screenSpaceError === 0.0 || parent!.hasTilesetContent || parent!.hasImplicitContent);
        let screenSpaceError = useParentScreenSpaceError ? parent!.screenSpaceError : tile.screenSpaceError;
        return tileset.root.screenSpaceError - screenSpaceError;
    }

    /**
     * 判断 是否需要优先级处理分辨率
     * @param tileset 
     * @param tile 
     */
    private isPriorityProgressiveResolution (tileset: Earth3DTileset, tile: Earth3DTile) {
        if (tileset.progressiveResolutionHeightFraction <= 0.0 || tileset.progressiveResolutionHeightFraction > 0.5) {
            return false;
        }
        let isProgressiveResolutionTile = tile._screenSpaceErrorProgressiveResolution > tileset.maximumScreenSpaceError;
        // Mark non-SSE leaves
        tile._priorityProgressiveResolutionScreenSpaceErrorLeaf = false;
        // Needed for skipLOD
        let parent = tile.parent;
        let maximumScreenSpaceError = tileset.maximumScreenSpaceError;
        let tilePasses = tile.screenSpaceErrorProgressiveResolution <= maximumScreenSpaceError;
        let parentFails = Utils.defined(parent) && parent!.screenSpaceErrorProgressiveResolution > maximumScreenSpaceError;
        if (tilePasses && parentFails) {
            // A progressive resolution SSE leaf, promote its priority as well
            tile._priorityProgressiveResolutionScreenSpaceErrorLeaf = false;
            isProgressiveResolutionTile = true;
        }
        return isProgressiveResolutionTile;
    }

    /**
     * 判断 是否优先级延后
     * @param tile 
     * @param frameState 
     */
    private isPriorityDeferred (tile: Earth3DTile, frameState: FrameState) {
        let tileset = tile.tileset;
        // If closest point on line is inside the sphere then set foveatedFactor to 0. Otherwise, the dot product is with the line from camera to the point on the sphere that is closest to the line.
        let sphereCenter = Transform.worldCar3ToEarthVec3(tile.boundingVolume.boundingSphereCenter, scratchWorldCartesian3);
        let metersPerUnit = Transform.getMetersPerUnit();
        let radius = tile.boundingVolume.boundingSphereRadius * metersPerUnit;
        let scaledCameraDirection = Cartesian3.multiplyScalar(scratchCartesian, frameState.cameraDirectionWC, tile.centerZDepth);
        let closestPointOnLine = Cartesian3.add(scratchCartesian, frameState.cameraPositionWC, scaledCameraDirection);
        // The distance from the camera's view direction to the tile.
        let toLine = Cartesian3.subtract(scratchCartesian, closestPointOnLine, sphereCenter);
        let distanceToCenterLine = Cartesian3.len(toLine);
        let notTouchingSphere = distanceToCenterLine > radius;

        // If camera's direction vector is inside the bounding sphere then consider
        // this tile right along the line of sight and set _foveatedFactor to 0.
        // Otherwise,_foveatedFactor is one minus the dot product of the camera's direction
        // and the vector between the camera and the point on the bounding sphere closest to the view line.
        if (notTouchingSphere) {
            let toLineNormalized = Cartesian3.normalize(scratchCartesian, toLine);
            let scaledToLine = Cartesian3.multiplyScalar(scratchCartesian, toLineNormalized, radius);
            let closestOnSphere = Cartesian3.add(scratchCartesian, sphereCenter, scaledToLine);
            let toClosestOnSphere = Cartesian3.subtract(scratchCartesian, closestOnSphere, frameState.cameraPositionWC);
            let toClosestOnSphereNormalize = Cartesian3.normalize(scratchCartesian, toClosestOnSphere);
            tile._foveatedFactor = 1 - Math.abs(Cartesian3.dot(frameState.cameraDirectionWC, toClosestOnSphereNormalize));
        } else {
            this._foveatedFactor = 0.0;
        }

        // Skip this feature if: non-skipLevelOfDetail and replace refine, if the foveated settings are turned off, if tile is progressive resolution and replace refine and skipLevelOfDetail (will help get rid of ancestor artifacts faster)
        // Or if the tile is a preload of any kind
        let replace = tile.refine === Earth3DTileRefine.REPLACE;
        let skipLevelOfDetail = tileset.skipLevelOfDetail;
        if (
            (replace && !skipLevelOfDetail) ||
            !tileset.foveatedScreenSpaceError ||
            tileset.foveatedConeSize === 1.0 ||
            (tile._priorityProgressiveResolution && replace && skipLevelOfDetail)) {
            //TODO 此处与Cesium源码不同 少了两个条件tileset._pass === Cesium3DTilePass.PRELOAD_FLIGHT ||
            //tileset._pass === Cesium3DTilePass.PRELOAD
            return false;
        }

        // 0.14 for fov = 60. NOTE very hard to defer vertically foveated tiles since max is based on fovy (which is fov). Lowering the 0.5 to a smaller fraction of the screen height will start to defer vertically foveated tiles.
        let maximumFovatedFactor = 1.0 - Math.cos(frameState.camera.fov * 0.5);
        let foveatedConeFactor = tileset.foveatedConeSize * maximumFovatedFactor;
        // If it's inside the user-defined view cone, then it should not be deferred.
        if (tile._foveatedFactor <= foveatedConeFactor) {
            return false;
        }
        // Relax SSE based on how big the angle is between the tile and the edge of the foveated cone.
        let range = maximumFovatedFactor - foveatedConeFactor;
        let normalizedFoveatedFactor = math.clamp(
            (tile._foveatedFactor - foveatedConeFactor) / range,
            0.0,
            1.0
        );
        let sseRelaxation = tileset.foveatedInterpolationCallback(
            tileset.foveatedMinimumScreenSpaceErrorRelaxation,
            tileset.maximumScreenSpaceError,
            normalizedFoveatedFactor
        );
        let sse =
            tile._screenSpaceError === 0.0 && Utils.defined(tile.parent)
                ? tile.parent!.screenSpaceError * 0.5
                : tile.screenSpaceError;

        return tileset.maximumScreenSpaceError - sseRelaxation <= sse;
    }


    private isolateDigits (normalizedValue: number, numberOfDigits: number, leftShift: number) {
        let scaled = normalizedValue * Math.pow(10, numberOfDigits);
        let integer = parseInt(String(scaled));
        return integer * Math.pow(10, leftShift);
    }

    private priorityNormalizeAndClamp (value: number, minimum: number, maximum: number) {
        return Math.max(
            math.normalize(value, minimum, maximum) - math.EPSILON7,
            0.0
        ); // Subtract epsilon since we only want decimal digits present in the output.
    }

    /**
     * 更新瓦片的优先级
     */
    public updatePriority () {
        let tileset = this.tileset;
        let preferLeaves = tileset.preferLeaves;
        let minimumPriority = tileset.minimumPriority;
        let maximumPriority = tileset.maximumPriority;

        // Combine priority systems together by mapping them into a base 10 number where each priority controls a specific set of digits in the number.
        // For number priorities, map them to a 0.xxxxx number then left shift it up into a set number of digits before the decimal point. Chop of the fractional part then left shift again into the position it needs to go.
        // For blending number priorities, normalize them to 0-1 and interpolate to get a combined 0-1 number, then proceed as normal.
        // Booleans can just be 0 or 10^leftshift.
        // Think of digits as penalties since smaller numbers are higher priority. If a tile has some large quantity or has a flag raised it's (usually) penalized for it, expressed as a higher number for the digit.
        // Priority number format: preloadFlightDigits(1) | foveatedDeferDigits(1) | foveatedDigits(4) | preloadProgressiveResolutionDigits(1) | preferredSortingDigits(4) . depthDigits(the decimal digits)
        // Certain flags like preferLeaves will flip / turn off certain digits to get desired load order.

        // Setup leftShifts, digit counts, and scales (for booleans)
        let digitsForANumber = 4;
        let digitsForABoolean = 1;

        let preferredSortingLeftShift = 0;
        let preferredSortingDigitsCount = digitsForANumber;

        let foveatedLeftShift =
            preferredSortingLeftShift + preferredSortingDigitsCount;
        let foveatedDigitsCount = digitsForANumber;

        let preloadProgressiveResolutionLeftShift =
            foveatedLeftShift + foveatedDigitsCount;
        let preloadProgressiveResolutionDigitsCount = digitsForABoolean;
        let preloadProgressiveResolutionScale = Math.pow(
            10,
            preloadProgressiveResolutionLeftShift
        );

        let foveatedDeferLeftShift =
            preloadProgressiveResolutionLeftShift +
            preloadProgressiveResolutionDigitsCount;
        let foveatedDeferDigitsCount = digitsForABoolean;
        let foveatedDeferScale = Math.pow(10, foveatedDeferLeftShift);

        let preloadFlightLeftShift =
            foveatedDeferLeftShift + foveatedDeferDigitsCount;
        let preloadFlightScale = Math.pow(10, preloadFlightLeftShift);

        // Compute the digits for each priority
        let depthDigits = this.priorityNormalizeAndClamp(
            this._depth,
            minimumPriority.depth,
            maximumPriority.depth
        );
        depthDigits = preferLeaves ? 1.0 - depthDigits : depthDigits;

        // Map 0-1 then convert to digit. Include a distance sort when doing non-skipLOD and replacement refinement, helps things like non-skipLOD photogrammetry
        let useDistance =
            !tileset.skipLevelOfDetail && this.refine === Earth3DTileRefine.REPLACE;
        let normalizedPreferredSorting = useDistance
            ? this.priorityNormalizeAndClamp(
                this.priorityHolder._distanceToCamera,
                minimumPriority.distance,
                maximumPriority.distance
            )
            : this.priorityNormalizeAndClamp(
                this._priorityReverseScreenSpaceError,
                minimumPriority.reverseScreenSpaceError,
                maximumPriority.reverseScreenSpaceError
            );
        let preferredSortingDigits = this.isolateDigits(
            normalizedPreferredSorting,
            preferredSortingDigitsCount,
            preferredSortingLeftShift
        );

        let preloadProgressiveResolutionDigits = this._priorityProgressiveResolution
            ? 0
            : preloadProgressiveResolutionScale;

        let normalizedFoveatedFactor = this.priorityNormalizeAndClamp(
            this.priorityHolder._foveatedFactor,
            minimumPriority.foveatedFactor,
            maximumPriority.foveatedFactor
        );
        let foveatedDigits = this.isolateDigits(
            normalizedFoveatedFactor,
            foveatedDigitsCount,
            foveatedLeftShift
        );

        let foveatedDeferDigits = this.priorityDeferred ? foveatedDeferScale : 0;

        // let preloadFlightDigits =
        //     tileset._pass === Cesium3DTilePass.PRELOAD_FLIGHT ? 0 : preloadFlightScale;
        let preloadFlightDigits = preloadFlightScale;
        // let preloadFlightDigits = 0;

        // Get the final base 10 number
        this._priority =
            depthDigits +
            preferredSortingDigits +
            preloadProgressiveResolutionDigits +
            foveatedDigits +
            foveatedDeferDigits +
            preloadFlightDigits;
    }

    /**
     * 判断 瓦片是否被销毁了
     * @returns 
     */
    private isDestroyed () {
        return false;
    }

    /**
     * 取消content请求
     */
    public cancelRequest () {
        if (Utils.defined(this._requestTask)) {
            this._requestTask.abort();
        }
    }

    /**
     * 请求内容
     */
    public requestContent () {
        if (this.hasEmptyContent) {
            return 0;
        }
        if (this.hasMultipleContents) {
            return this.requestMultipleContents(this);
        }

        return this.requestSingleContent(this);
    }

    /**
     * 请求多个内容
     * @param tile 
     */
    private requestMultipleContents (tile: Earth3DTile) {
        return 0;
    }

    /**
     * 创建 获取 content 二进制 数据的 promise
     */
    private createFetchContentArrayBufferPromise (tile: Earth3DTile) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            let tileset = tile.tileset;
            let absoluteUri = Utils.getAbsouteUri(tile.tilesetRecourceUri || "", tile.resourceUri!);
            this._requestTask = AssetLoader.requestArrayBuffer(Object.assign({}, tileset.assetLoadParams, {
                url: absoluteUri,
                priority: tile.priority,
            }), (res: { buffer: ArrayBuffer, result: RequestTaskResult }) => {
                if (res.buffer) {
                    resolve(res.buffer);
                } else {
                    reject(res.result);
                }
            });
        });
    }

    /**
     * 请求单个内容
     * @param tile 
     */
    private requestSingleContent (tile: Earth3DTile) {
        let promise = tile.createFetchContentArrayBufferPromise(tile);
        let previousState = tile.contentState;
        let tileset = tile.tileset;
        tile._contentState = Earth3DTileContentState.LOADING;
        promise.then((arrayBuffer: any) => {
            if (tile.isDestroyed()) {
                // Tile is unloaded before the content finishes loading
                tile.singleContentFailed(tileset, tile, "tile has been destroy.");
                return;
            }
            let content = tile.makeContent(tile, arrayBuffer);
            tile._contentState = Earth3DTileContentState.PROCESSING;
            content.readyPromise.then((content: IEarth3DTileContent) => {
                if (tile.isDestroyed()) {
                    //Tile is unloaded before the content finishes processing
                    tile.singleContentFailed(tileset, tile, "tile has been destroy.");
                    return;
                }
                tile._selectedFrame = 0;
                tile._lastStyleTime = 0;
                tile._content = content;
                tile._contentState = Earth3DTileContentState.READY;
                tile._contentReadyPromise_resolve(content);
            });
        }).catch((err: RequestTaskResult) => {
            //TODO Cancelled due to low priority - try again later.
            if (err && err.status === RequestTaskStatus.ABORT) {
                tile._contentState = previousState;
            } else {
                tile.singleContentFailed(tileset, tile, err);
            }
        });
        return 0;
    }

    /**
     * 单个内容请求失败处理
     * @param tileset 
     * @param tile 
     */
    private singleContentFailed (tileset: Earth3DTileset, tile: Earth3DTile, err: any) {
        tile._contentState = Earth3DTileContentState.FAILED;
        tile._contentReadyPromise_reject!(err);
    }

    /**
     * 创建tile的内容
     * @param tile 
     * @param arrayBuffer 
     */
    private makeContent (tile: Earth3DTile, arrayBuffer: any): IEarth3DTileContent {
        let preprocessed = preprocess3DTileContent(arrayBuffer);

        // Vector and Geometry tile rendering do not support the skip LOD optimization.
        let tileset = tile._tileset;
        tileset.disableSkipLevelOfDetail =
            tileset.disableSkipLevelOfDetail ||
            preprocessed.contentType === Earth3DTileContentType.GEOMETRY ||
            preprocessed.contentType === Earth3DTileContentType.VECTOR;

        if (preprocessed.contentType === Earth3DTileContentType.IMPLICIT_SUBTREE) {
            tile._hasImplicitContent = true;
        }

        if (preprocessed.contentType === Earth3DTileContentType.EXTERNAL_TILESET) {
            tile._hasTilesetContent = true;
        }

        let content;
        let contentFactory = Earth3DTileContentFactory[preprocessed.contentType];
        if (Utils.defined(preprocessed.binaryPayload)) {
            content = contentFactory(tileset, tile, preprocessed.binaryPayload!.buffer, 0);
        } else {
            content = contentFactory(tileset, tile, preprocessed.jsonPayload!);
        }

        let contentHeader = tile.header.content;


        return content;
    }

    /**
     * 卸载content
     */
    public unloadContent () {
        if (this.hasEmptyContent || this.hasTilesetContent || this.hasImplicitContent) {
            return;
        }

        if (Utils.defined(this.content)) {
            this.content!.destroy();
            this._content = undefined;
        }
        this._contentState = Earth3DTileContentState.UNLOADED;
        this._lastStyleTime = 0.0;
        this.disposeBoundingVolemeMesh();
    }

    /**
     * 更新 3dtile content
     * @param tile 
     * @param tileset 
     * @param frameState 
     */
    private updateContent (tile: Earth3DTile, tileset: Earth3DTileset, frameState: FrameState) {
        let content = tile.content;
        content?.update(tileset, frameState);
    }

    /**
     * 更新 3dtile
     */
    public update (tileset: Earth3DTileset, frameState: FrameState) {
        this.updateContent(this, tileset, frameState);
    }

    /**
     * 显示content
     * @param tileset 
     */
    public showContent (tileset: Earth3DTileset) {
        this.content?.show(tileset);
        this.showBoundingVolumeMesh();
    }

    /**
     * 隐藏content
     * @param tileset 
     */
    public hideContent (tileset: Earth3DTileset) {
        this.content?.hide(tileset);
        this.hideBoundingVolumeMesh();
    }

    private showBoundingVolumeMesh () {
        if (!InternalConfig.SHOW_3DTILE_BOUNDING_VOLUME) return;
        if (this._boundingVolume) {
            if (!this._boundingVolumeMaterial) {
                this._boundingVolumeMaterial = InternalConfig.get3dtileBoundingVolumeMaterial();
            }
            if (!this._boundingVolumeMesh) {
                this._boundingVolumeMesh = this._boundingVolume.createBoundingMesh(this._boundingVolumeMaterial);
                this._boundingVolumeMesh.renderOrder = EARTH_3DTILE_BOUNDING_VOLUME_RENDER_ORDER;
            }
            if (!this._boundingVolumeMesh.parent) {
                this.tileset.container.add(this._boundingVolumeMesh);
            }

        }
    }

    private hideBoundingVolumeMesh () {
        if (!InternalConfig.SHOW_3DTILE_BOUNDING_VOLUME) return;
        if (this._boundingVolumeMesh && this._boundingVolumeMesh.parent) {
            this._boundingVolumeMesh.removeFromParent();
        }
    }

    private disposeBoundingVolemeMesh () {
        if (!InternalConfig.SHOW_3DTILE_BOUNDING_VOLUME) return;
        if (this._boundingVolumeMesh) {
            this.hideBoundingVolumeMesh();
            disposeSystem.disposeObj(this._boundingVolumeMesh.geometry);
            //@ts-ignore
            disposeSystem.disposeObj(this._boundingVolumeMesh.material);
            this._boundingVolumeMesh = null;
        }
    }

}