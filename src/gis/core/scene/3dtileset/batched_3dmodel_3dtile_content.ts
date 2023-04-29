import { Material, Matrix4, Mesh, Object3D, Vector3 } from "three";
import { MatConstants } from "../../../../core/constants/mat_constants";
import { disposeSystem } from "../../../../core/system/dispose_system";
import { Utils } from "../../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../../@types/core/earth_3dtileset";
import { GltfUtils } from "../../../utils/gltf_utils";
import { Matrix4Utils } from "../../../utils/matrix4_utils";
import { Cartesian3 } from "../../cartesian/cartesian3";
import { Cartesian4 } from "../../cartesian/cartesian4";
import { Cartographic } from "../../cartographic";
import { Axis } from "../../misc/axis";
import { ComponentDatatype } from "../../misc/component_data_type";
import { getJsonFromTypedArray } from "../../misc/get_json_from_typed_array";
import { Transform } from "../../transform/transform";
import { FrameState } from "../frame_state";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";
import { Earth3DTileBatchTable } from "./earth_3dtile_batch_table";
import { IEarth3DTileContent } from "./earth_3dtile_content";
import { Earth3DTileFeatureTable } from "./earth_3dtile_feature_table";
import { reprojectWorkerPool } from "../../worker/pool/reproject_worker_pool";
import { InternalConfig } from "../../internal/internal_config";
import { EARTH_3DTILE_B3DM_RENDER_ORDER } from "../../misc/render_order";
import { Earth3DTileFeature } from "./earth_3dtile_feature";


const sizeOfUint32 = Uint32Array.BYTES_PER_ELEMENT;
let scratchComputedMatrixIn2D = new Matrix4();
let scratchCartesian3 = new Cartesian3();
let scratchVec3 = new Vector3();
let scratchCartographic = new Cartographic();


export class Batched3DModel3DTileContent implements IEarth3DTileContent {

    public _readyPromise: Promise<IEarth3DTileContent>;

    private _readyPromise_resolve: Function;

    private _readyPromise_reject: Function;

    private _tileset: Earth3DTileset;

    private _tile: Earth3DTile;

    private _gltf: any;

    private _group: Object3D;

    private _featurePropertiesDirty: boolean;

    private _rtcCenterTransform: Matrix4;

    private _contentModelMatrix: Matrix4;

    private _rtcCenter3D: Cartesian3;

    private _rctCenter2D: Cartesian3;

    private _rtcCenter: Cartesian3;

    private _computedMartix: Matrix4;

    private _pointsLength: number = 0;
    private _trianglesLength: number = 0;
    private _geometryByteLength: number = 0;
    private _texturesByteLength: number = 0;
    private _batchTableByteLength: number = 0;
    private _innerContents?: IEarth3DTileContent[];
    private _batchTable?: Earth3DTileBatchTable;
    private _batchLength: number = 0;
    private _featureTable: Earth3DTileFeatureTable;

    private _features: Earth3DTileFeature[] = [];

    public get featuresLength () {
        return this._featureTable.featuresLength;
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

    public get batchLength () {
        return this._batchLength;
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
        this._featureTable = featureTable;

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
        this._batchLength = batchLength;

        //init features
        for (let i = 0; i < this._batchLength; i++) {
            this._features.push(new Earth3DTileFeature(this, i));
        }

        let gltfByteLength = byteStart + byteLength - byteOffset;
        if (gltfByteLength === 0) {
            throw new Error("glTF byte length must be greater than 0.");
        }

        let gltfView: Uint8Array;
        if (byteOffset % 4 === 0) {
            // gltfView = new Uint8Array(arrayBuffer, byteOffset, gltfByteLength);
            gltfView = new Uint8Array(arrayBuffer.slice(byteOffset, byteOffset + gltfByteLength));
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

        this.tileset.gltfLoader.parseAsync(gltfView.buffer, '').then(gltf => {
            this._gltf = gltf;
            this._group = this._gltf.scene;

            const meshes: Mesh[] = [];

            if (this._group.children) {
                for (let i = 0; i < this._group.children.length; i++) {
                    const ele = this._group.children[i];
                    if (ele instanceof Mesh) {
                        if (!Utils.defined(this.tileset.customMaterial)) {
                            if (!ele.material) ele.material = InternalConfig.getB3dmMaterial();
                            else {
                                ele.material = InternalConfig.handleB3dmMaterial(ele.material);
                            }
                        } else {
                            //dispose old
                            disposeSystem.disposeObj(ele.material);
                            ele.material = this.tileset.customMaterial(this.tileset, this.tile, this);
                        }
                        ele.renderOrder = EARTH_3DTILE_B3DM_RENDER_ORDER;
                        meshes.push(ele);
                    }
                }
            }

            this.updateContentMatrix(this.tile, gltf);

            //重投影
            reprojectWorkerPool.getInstance().projectMeshes(meshes, this._contentModelMatrix, this.tileset.coordinateOffsetType).then(ms => {
                this._readyPromise_resolve(this);
            });


        }).catch(err => {
            this._readyPromise_reject(err);
        });
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
            computedContentMatrix = Matrix4Utils.multiply(to2D, computedContentMatrix, scratchComputedMatrixIn2D);
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
        let wVec = Transform.geoCar3ToWorldVec3(cCar, scratchVec3);


        Matrix4Utils.setTranslation(computedContentMatrix, wVec, computedContentMatrix);

        this._computedMartix = computedContentMatrix;

        if (this._group) {
            this._group.applyMatrix4(this._computedMartix);
            this._group.matrixWorldNeedsUpdate = true;
        }

    }


    public show (tileset: Earth3DTileset): void {
        if (this._group) {
            if (!this._group.parent) tileset.container.add(this._group);
            if (!this._group.visible) this._group.visible = true;
        }
    }



    public hide (tileset: Earth3DTileset) {
        if (this._group) {
            this._group.visible = false;
        }
    }

    /**
     * tileset变换信息改变 需要重新创建模型
     * @param tilset 
     * @param frameState 
     */
    public update (tilset: Earth3DTileset, frameState: FrameState) {
        this.updateContentMatrix(this.tile, this._gltf);
    }

    public getFeature (batchId: number) {
        return this._features[batchId];
    }

    public hasProperty (batchId: number, name: string) {
        return this._batchTable && this._batchTable.hasProperty(batchId, name);
    }

    /**
     * 释放节点资源
     */
    private releaseResource () {
        if (this._group.parent) this._group.removeFromParent();
        if (this._group && this._group.children) {
            for (let i = 0; i < this._group.children.length; i++) {
                const ele = this._group.children[i];
                if (ele instanceof Mesh) {
                    disposeSystem.disposeObj(ele.material as Material);
                }
            }
        }
    }

    public destroy (): void {
        this.releaseResource();
        this._texturesByteLength = 0;
        this._geometryByteLength = 0;
        this._batchTableByteLength = 0;
        this._pointsLength = 0;
        this._trianglesLength = 0;
        this._batchLength = 0;
        this._batchTable = null;
        this._featureTable = null;
        this._features = null;
    }

}