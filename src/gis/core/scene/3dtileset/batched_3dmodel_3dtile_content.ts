import { Matrix4, Vector3 } from "three";
import { MatConstants } from "../../../../core/constants/mat_constants";
import { Utils } from "../../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../../@types/core/earth_3dtileset";
import { GltfUtils } from "../../../utils/gltf_utils";
import { Matrix4Utils } from "../../../utils/matrix4_utils";
import { gltfCache } from "../../cache/gltf_cache";
import { Cartesian3 } from "../../cartesian/cartesian3";
import { Cartesian4 } from "../../cartesian/cartesian4";
import { Cartographic } from "../../cartographic";
import { GltfLoader } from "../../loader/gltf_loader";
import { Axis } from "../../misc/axis";
import { ComponentDatatype } from "../../misc/component_data_type";
import { getJsonFromTypedArray } from "../../misc/get_json_from_typed_array";
import { Transform } from "../../transform/transform";
import { FrameState } from "../frame_state";
import { GltfConvert } from "../model/gltf/gltf_convert";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";
import { Earth3DTileBatchTable } from "./earth_3dtile_batch_table";
import { IEarth3DTileContent } from "./earth_3dtile_content";
import { Earth3DTileFeatureTable } from "./earth_3dtile_feature_table";
const buffer = require("buffer/");


const sizeOfUint32 = Uint32Array.BYTES_PER_ELEMENT;
let scratchComputedMatrixIn2D = new Matrix4();
let scratchCartesian3 = new Cartesian3();
let scratchVec3 = new Vector3();
let scratchCartographic = new Cartographic();


export class Batched3DModel3DTileContent implements IEarth3DTileContent {

    public _readyPromise: Promise<IEarth3DTileContent>;

    private _readyPromise_resolve: Function | undefined;

    private _readyPromise_reject: Function | undefined;

    private _tileset: Earth3DTileset;

    private _tile: Earth3DTile;

    private _featurePropertiesDirty: boolean;

    private _rtcCenterTransform: Matrix4 | undefined;

    private _contentModelMatrix: Matrix4 | undefined;

    private _rtcCenter3D: Cartesian3 | undefined;

    private _rctCenter2D: Cartesian3 | undefined;

    private _rtcCenter: Cartesian3 | undefined;

    private _node: Node | undefined;

    private _computedMartix: Matrix4 | undefined;

    private _destroyed: boolean = false;

    private _textureImageHandledCount: number = 0;

    private _textureImageHandledTargetCount: number = 0;

    private _featuresLength: number = 0;
    private _pointsLength: number = 0;
    private _trianglesLength: number = 0;
    private _geometryByteLength: number = 0;
    private _texturesByteLength: number = 0;
    private _batchTableByteLength: number = 0;
    private _innerContents?: IEarth3DTileContent[];
    private _batchTable?: Earth3DTileBatchTable;

    public get featuresLength () {
        return this._featuresLength;
    }

    public get pointsLength () {
        return this._pointsLength;
    }

    public get trianglesLength () {
        return this._trianglesLength;
    }

    public get geometryByteLength () {
        return this._geometryByteLength;
    }

    public get texturesByteLength () {
        return this._texturesByteLength;
    }

    public get batchTableByteLength () {
        return this._batchTableByteLength;
    }

    public get innerContents () {
        return this._innerContents;
    }

    public get batchTable () {
        return this._batchTable;
    }

    public get readyPromise () {
        return this._readyPromise;
    }

    public get tileset () {
        return this._tileset;
    }

    public get tile () {
        return this._tile;
    }

    public get featurePropertiesDirty () {
        return this._featurePropertiesDirty;
    }

    constructor (tileset: Earth3DTileset, tile: Earth3DTile, arrayBuffer: ArrayBuffer, byteOffset?: number) {
        this._tileset = tileset;
        this._tile = tile;
        this._featurePropertiesDirty = false;
        this._readyPromise = this.createReadyPromise();
        this.initialize(arrayBuffer, byteOffset);
    }

    private createReadyPromise () {
        return new Promise<IEarth3DTileContent>((resolve, reject) => {
            this._readyPromise_resolve = resolve;
            this._readyPromise_reject = reject;
        });
    }

    private createNode () {
        // let node = Utils.createNodeWithName("b3dmGltfNode");
        // //默认不显示
        // node.active = false;
        // this._node = node;
        // return node;
    }

    /**
     * 初始化
     * @param arrayBuffer 
     * @param byteOffset 
     */
    private initialize (arrayBuffer: ArrayBuffer, byteOffset?: number) {
        let tileset = this._tileset;
        let tile = this._tile;
        let byteStart = Utils.defaultValue(byteOffset, 0);
        byteOffset = byteStart;
        let uint8Array = new Uint8Array(arrayBuffer);
        let view = new DataView(arrayBuffer);
        byteOffset = byteOffset! + sizeOfUint32;
        let version = view.getUint32(byteOffset, true);
        if (version !== 1) {
            throw new Error(
                "Only Batched 3D Model version 1 is supported.  Version " +
                version +
                " is not."
            );
        }
        byteOffset += sizeOfUint32;

        let byteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let featureTableJsonByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let featureTableBinaryByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let batchTableJsonByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let batchTableBinaryByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let batchLength;

        // Legacy header #1: [batchLength] [batchTableByteLength]
        // Legacy header #2: [batchTableJsonByteLength] [batchTableBinaryByteLength] [batchLength]
        // Current header: [featureTableJsonByteLength] [featureTableBinaryByteLength] [batchTableJsonByteLength] [batchTableBinaryByteLength]
        // If the header is in the first legacy format 'batchTableJsonByteLength' will be the start of the JSON string (a quotation mark) or the glTF magic.
        // Accordingly its first byte will be either 0x22 or 0x67, and so the minimum uint32 expected is 0x22000000 = 570425344 = 570MB. It is unlikely that the feature table JSON will exceed this length.
        // The check for the second legacy format is similar, except it checks 'batchTableBinaryByteLength' instead
        if (batchTableJsonByteLength >= 570425344) {
            // First legacy check
            byteOffset -= sizeOfUint32 * 2;
            batchLength = featureTableJsonByteLength;
            batchTableJsonByteLength = featureTableBinaryByteLength;
            batchTableBinaryByteLength = 0;
            featureTableJsonByteLength = 0;
            featureTableBinaryByteLength = 0;
            console.warn(
                "b3dm-legacy-header",
                "This b3dm header is using the legacy format [batchLength] [batchTableByteLength]. The new format is [featureTableJsonByteLength] [featureTableBinaryByteLength] [batchTableJsonByteLength] [batchTableBinaryByteLength] from https://github.com/CesiumGS/3d-tiles/tree/master/specification/TileFormats/Batched3DModel."
            );
        } else if (batchTableBinaryByteLength >= 570425344) {
            // Second legacy check
            byteOffset -= sizeOfUint32;
            batchLength = batchTableJsonByteLength;
            batchTableJsonByteLength = featureTableJsonByteLength;
            batchTableBinaryByteLength = featureTableBinaryByteLength;
            featureTableJsonByteLength = 0;
            featureTableBinaryByteLength = 0;
            console.warn(
                "b3dm-legacy-header",
                "This b3dm header is using the legacy format [batchTableJsonByteLength] [batchTableBinaryByteLength] [batchLength]. The new format is [featureTableJsonByteLength] [featureTableBinaryByteLength] [batchTableJsonByteLength] [batchTableBinaryByteLength] from https://github.com/CesiumGS/3d-tiles/tree/master/specification/TileFormats/Batched3DModel."
            );
        }

        let featureTableJson;
        if (featureTableJsonByteLength === 0) {
            featureTableJson = {
                BATCH_LENGTH: Utils.defaultValue(batchLength, 0),
            };
        } else {
            featureTableJson = getJsonFromTypedArray(
                uint8Array,
                byteOffset,
                featureTableJsonByteLength
            );
            byteOffset += featureTableJsonByteLength;
        }

        let featureTableBinary = new Uint8Array(
            arrayBuffer,
            byteOffset,
            featureTableBinaryByteLength
        );
        byteOffset += featureTableBinaryByteLength;

        let featureTable = new Earth3DTileFeatureTable(
            featureTableJson,
            featureTableBinary
        );

        batchLength = featureTable.getGlobalProperty("BATCH_LENGTH");
        featureTable.featuresLength = batchLength;

        let batchTableJson;
        let batchTableBinary;
        if (batchTableJsonByteLength > 0) {
            // PERFORMANCE_IDEA: is it possible to allocate this on-demand?  Perhaps keep the
            // arraybuffer/string compressed in memory and then decompress it when it is first accessed.
            //
            // We could also make another request for it, but that would make the property set/get
            // API async, and would double the number of numbers in some cases.
            batchTableJson = getJsonFromTypedArray(
                uint8Array,
                byteOffset,
                batchTableJsonByteLength
            );
            byteOffset += batchTableJsonByteLength;

            if (batchTableBinaryByteLength > 0) {
                // Has a batch table binary
                batchTableBinary = new Uint8Array(
                    arrayBuffer,
                    byteOffset,
                    batchTableBinaryByteLength
                );
                // Copy the batchTableBinary section and let the underlying ArrayBuffer be freed
                batchTableBinary = new Uint8Array(batchTableBinary);
                byteOffset += batchTableBinaryByteLength;
            }
        }

        let colorChangedCallback;
        // if (defined(content._classificationType)) {
        //     colorChangedCallback = createColorChangedCallback(content);
        // }

        let batchTable = new Earth3DTileBatchTable(
            this, batchLength, batchTableJson, batchTableBinary, colorChangedCallback
        );
        this._batchTable = batchTable;


        let gltfByteLength = byteStart + byteLength - byteOffset;
        if (gltfByteLength === 0) {
            throw new Error("glTF byte length must be greater than 0.");
        }

        let gltfView;
        if (byteOffset % 4 === 0) {
            gltfView = new Uint8Array(arrayBuffer, byteOffset, gltfByteLength);
        } else {
            // Create a copy of the glb so that it is 4-byte aligned
            console.error(
                "b3dm-glb-unaligned",
                "The embedded glb is not aligned to a 4-byte boundary."
            );
            gltfView = new Uint8Array(
                uint8Array.subarray(byteOffset, byteOffset + gltfByteLength)
            );
        }

        //转换gltf
        // let gltf = parseGlb(gltfView);
        let gltf = GltfConvert.convertGlbToGltf(new buffer.Buffer(gltfView), true);

        this._rtcCenterTransform = MatConstants.Mat4_IDENTITY;
        var rtcCenter = featureTable.getGlobalProperty(
            "RTC_CENTER",
            ComponentDatatype.FLOAT,
            3
        );
        if (Utils.defined(rtcCenter)) {
            scratchCartesian3.x = rtcCenter[0];
            scratchCartesian3.y = rtcCenter[1];
            scratchCartesian3.z = rtcCenter[2];
            this._rtcCenterTransform = new Matrix4().makeTranslation(scratchCartesian3.x, scratchCartesian3.y, scratchCartesian3.z);

        }

        let node = this.createNode();

        this.updateContentMatrix(this.tile, gltf);


        GltfLoader.loadByJson(this.tileset.tilingScheme.projection, this._contentModelMatrix, this.tileset.coordinateOffsetType, this.tileset.gltfUpAxis, gltf);
    }

    private updateContentMatrix (tile: Earth3DTile, gltf: any) {
        this._contentModelMatrix = Matrix4Utils.multiply(
            tile.computedTransform,
            this._rtcCenterTransform!,
            new Matrix4()
        );
        let tilingScheme = tile.tileset.tilingScheme;
        let translation = Matrix4Utils.getTranslation(this._contentModelMatrix, scratchCartesian3);
        let conCenter = tilingScheme.projection.ellipsoid.cartesianToCartographic(translation);

        this._rtcCenter3D = GltfUtils.getRtcCenter(gltf);
        if (Utils.defined(this._rtcCenter3D)) {
            this._rctCenter2D = tilingScheme.projection.project(conCenter!);
            this._rtcCenter = this._rtcCenter3D;
        }

        let mTranslation = new Cartesian4(this._contentModelMatrix.elements[12], this._contentModelMatrix.elements[13], this._contentModelMatrix.elements[14], this._contentModelMatrix.elements[15]);
        let computedContentMatrix = this._contentModelMatrix;

        if (!Cartesian4.equals(mTranslation, Cartesian4.UNIT_W)) {
            computedContentMatrix = Transform.basisTo2D(tilingScheme.projection, computedContentMatrix, scratchComputedMatrixIn2D);
            this._rtcCenter = this._rtcCenter3D;
        } else {
            let bsCenter = this.tile.boundingVolume.boundingSphereCenter;
            let centerC = Transform.worldCar3ToGeoCar3(bsCenter, scratchCartesian3);
            let centerCar = tilingScheme.projection.unproject(centerC, scratchCartographic);
            let center = tilingScheme.projection.ellipsoid.cartographicToCartesian(centerCar);
            let to2D = Transform.wgs84To2DModelMatrix(tilingScheme.projection, center, scratchComputedMatrixIn2D);
            computedContentMatrix = Matrix4Utils.multiply(scratchComputedMatrixIn2D, to2D, computedContentMatrix);
            if (Utils.defined(this._rtcCenter)) {
                Matrix4Utils.setTranslation(computedContentMatrix, Cartesian4.UNIT_W, computedContentMatrix);
                this._rtcCenter = this._rctCenter2D;
            }
        }

        if (this.tileset.gltfUpAxis === Earth3DTilesetGltfUpAxis.Z) {
            Matrix4Utils.multiplyTransformation(computedContentMatrix, Axis.Z_UP_TO_Y_UP, computedContentMatrix);
        }

        computedContentMatrix.scale(Transform.getMetersScale());

        scratchCartesian3.x = computedContentMatrix.elements[12];
        scratchCartesian3.y = computedContentMatrix.elements[13];
        scratchCartesian3.z = computedContentMatrix.elements[14];
        Transform.wgs84ToCartesian(tilingScheme.projection, scratchCartesian3, this.tileset.coordinateOffsetType, scratchCartesian3);
        let cCar = scratchCartesian3;
        let wVec = Transform.earthCar3ToWorldVec3(cCar, scratchVec3);


        Matrix4Utils.setTranslation(computedContentMatrix, wVec, computedContentMatrix);

        this._computedMartix = computedContentMatrix;

    }


    /**
     * 获取mesh合并处理方法
     * @param computedContentMatrix 
     * @returns 
     */
    // private getMergeMeshHandler (computedContentMatrix: Mat4, cacheId: string) {
    // let _this = this;
    // return function (node: Node, ccmodel: any, meshArr: Mesh[], materials: Material[], materialImageAssetRecord: Record<string, ImageAsset | ImageBitmap>, dictGroup: Record<string, []>, json: any, options: GltfLoaderOptions) {
    //     if (_this._destroyed) {
    //         for (let i = 0; i < meshArr.length; i++) {
    //             const mesh = meshArr[i];
    //             mesh.destroy();
    //         }
    //         for (let i = 0; i < materials.length; i++) {
    //             const mat = materials[i];
    //             GISResLoader.instance.releaseMaterialTextureResource(mat);
    //             mat.destroy();
    //         }
    //         return;
    //     }

    //     if (options.mergeMesh) {
    //         let finalMeshArr: Mesh[] = [];
    //         let mergedCount = 0;
    //         let finalMesh = meshArr.length === 1 ? meshArr[0] : new Mesh();
    //         finalMeshArr.push(finalMesh);
    //         if (meshArr.length === 1) {
    //             //TODO 读取gltf中的变换信息
    //             let nodeMatrix = Matrix4.multiplyTransformation(computedContentMatrix, GltfUtils.getNodeMatrix(json, 0), new Mat4());
    //             node.matrix = nodeMatrix;
    //         } else {
    //             for (let i = 0; i < meshArr.length; i++) {
    //                 const mesh = meshArr[i];
    //                 if (mergedCount >= options.batchCount!) {
    //                     finalMesh = new Mesh();
    //                     mergedCount = 0;
    //                     finalMeshArr.push(finalMesh);
    //                 }
    //                 //TODO 读取gltf中的变换信息
    //                 let nodeMatrix = Matrix4.multiplyTransformation(computedContentMatrix, GltfUtils.getNodeMatrix(json, i), new Mat4());

    //                 finalMesh.merge(mesh, nodeMatrix);
    //                 mergedCount++;
    //             }
    //         }

    //         let mt = materials[0];

    //         for (let i = 0; i < finalMeshArr.length; i++) {
    //             const fmesh = finalMeshArr[i];
    //             let meshRender = node.addComponent(MeshRenderer);
    //             meshRender.mesh = fmesh;
    //             meshRender.setMaterial(Utils.defined(_this.tileset.material) ? _this.tileset.material!.material : mt, 0);
    //         }
    //         _this._geometryByteLength += finalMesh.data.byteLength;
    //         let imageAsset = materialImageAssetRecord[mt.hash];
    //         if (Utils.defined(imageAsset)) {
    //             _this._texturesByteLength += imageAsset.width * imageAsset.height * 4;
    //         }

    //     } else {
    //         let nodeMatrix = Matrix4.multiplyTransformation(computedContentMatrix, GltfUtils.getNodeMatrix(json, 0), new Mat4());
    //         node.matrix = nodeMatrix;
    //         for (let i = 0; i < meshArr.length; i++) {
    //             const mesh = meshArr[i];
    //             _this._geometryByteLength += mesh.data.byteLength;
    //             let meshRender = node.addComponent(MeshRenderer);
    //             meshRender.mesh = mesh;
    //             let mts = dictGroup[i];
    //             for (const matIndex in mts) {
    //                 let mater = Utils.defined(_this.tileset.material) ? _this.tileset.material!.material : materials[mts[matIndex]];
    //                 mater.addRef();
    //                 meshRender.setMaterial(mater, Number(matIndex));
    //                 let imageAsset = materialImageAssetRecord[mater.hash];
    //                 if (Utils.defined(imageAsset)) {
    //                     _this._texturesByteLength += imageAsset.width * imageAsset.height * 4;
    //                 }
    //             }
    //         }
    //     }

    //     //缓存贴图 图片资源
    //     GltfCacheManager.instance.cacheGltf(cacheId, {
    //         materialImageAssetRecord: materialImageAssetRecord
    //     });
    //     if (Object.keys(materialImageAssetRecord).length > 0) {
    //         _this.loadContentTexture();
    //     } else {
    //         _this._readyPromise_resolve!(_this);
    //     }


    // };
    // }

    //单张贴图处理完成
    // private onTextureImageHandled (texture: Texture2D, imageAsset: ImageAsset, material: any) {
    //     this._textureImageHandledCount++;
    //     material.setProperty("mainTexture", texture);
    //     if (this._textureImageHandledCount >= this._textureImageHandledTargetCount) {
    //         this._textureImageHandledCount = 0;
    //         this._textureImageHandledTargetCount = 0;
    //         this._readyPromise_resolve!(this);
    //     }
    // }

    //加载贴图
    // private loadContentTexture () {
    //     let meshRenderArr = this._node!.getComponents(MeshRenderer);
    //     let cache = GltfCacheManager.instance.getCache(this.tile.id);
    //     if (Utils.defined(cache)) {
    //         let materialImageAssetRecord = cache.materialImageAssetRecord;
    //         if (materialImageAssetRecord && Object.keys(materialImageAssetRecord).length > 0) {
    //             for (let i = 0; i < meshRenderArr.length; i++) {
    //                 const meshRender = meshRenderArr[i];
    //                 let materials = meshRender.materials;
    //                 if (Utils.defined(materials)) {
    //                     for (let j = 0; j < materials.length; j++) {
    //                         const material = materials[j];
    //                         if (Utils.defined(material)) {
    //                             let imageAsset = materialImageAssetRecord[material!.hash];
    //                             GISResLoader.instance.createTexture2DWithImageAsset(imageAsset as ImageAsset, true, this.onTextureImageHandled, this, material!);
    //                             this._textureImageHandledTargetCount++;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    public show (tileset: Earth3DTileset): void {
        // if (!this._node!.parent) {
        //     this._node!.parent = tileset.node;
        // }
        // if (!this._node!.active) {
        //     this._node!.active = true;
        // }
    }



    public hide (tileset: Earth3DTileset) {
        // if (this._node!.parent) {
        //     this._node!.removeFromParent();
        // }
        // if (this._node!.active) {
        //     this._node!.active = false;
        // }
    }

    /**
     * tileset变换信息改变 需要重新创建模型
     * @param tilset 
     * @param frameState 
     */
    public update (tilset: Earth3DTileset, frameState: FrameState) {
        let cacheInfo = gltfCache.getCache(this.tile.id);
        this.updateContentMatrix(this.tile, cacheInfo.gltf);
    }

    /**
     * 释放节点资源
     */
    private releaseNodeResource (releaseAll: boolean) {
        // let meshRenderArr = this._node!.getComponents(MeshRenderer);
        // if (meshRenderArr !== null) {
        //     for (let i = 0; i < meshRenderArr!.length; i++) {
        //         const meshRender = meshRenderArr![i];
        //         meshRender.materials.forEach(mat => {
        //             if (Utils.defined(mat)) {
        //                 GISResLoader.instance.releaseMaterialTextureResource(mat!);
        //             }
        //             if (releaseAll) {
        //                 mat?.decRef();
        //                 mat?.destroy();
        //                 GISResLoader.instance.releaseNodeMeshResource(this._node!);
        //             }
        //         });
        //     }
        // }
    }

    public destroy (): void {
        this._destroyed = true;
        this.releaseNodeResource(true);
        this._texturesByteLength = 0;
        this._geometryByteLength = 0;
        this._batchTableByteLength = 0;
        gltfCache.release(this.tile.id);
    }

}