//@ts-nocheck
import { Color, Matrix4, Vector3 } from "three";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../../@types/core/earth_3dtileset";
import { Log } from "../../../log/log";
import { Matrix4Utils } from "../../../utils/matrix4_utils";
import { Cartesian3 } from "../../cartesian/cartesian3";
import { Cartesian4 } from "../../cartesian/cartesian4";
import { arraySlice } from "../../misc/array_slice";
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
import { PointCloudShading } from "./pointcloud_shading";

const defaultShading = new PointCloudShading();
const sizeOfUint32 = Uint32Array.BYTES_PER_ELEMENT;

const scratchCartesian3 = new Cartesian3();
const scratchVec3 = new Vector3();

const enum DecodingState {
    NEEDS_DECODE = 1,
    DECODING,
    READY,
    FAILED,
};

export class PointCloud3DTileContent implements IEarth3DTileContent {

    private log = new Log(PointCloud3DTileContent);

    private _tileset: Earth3DTileset;

    private _tile: Earth3DTile;

    private _featurePropertiesDirty: boolean;

    private _readyPromise: Promise<IEarth3DTileContent>;

    private _readyPromise_resolve: Function | undefined;

    private _readyPromise_reject: Function | undefined;

    //draco
    private _decodingState: DecodingState | undefined;
    private _dequantizeInShader: boolean = true;
    private _isQuantizedDraco: boolean = false;
    private _isOctEncodedDraco: boolean = false;
    private _quantizedRange: number = 0.0;
    private _octEncodedRange: number = 0.0;

    private _rtcCenter: Cartesian3 | undefined;
    private _quantizedVolumeScale: Cartesian3 | undefined;
    private _quantizedVolumeOffset: Cartesian3 | undefined;

    private _modelMatrix: Matrix4;
    private _projectedTransform: Matrix4;

    private _constantColor: Color = new Color("#A9A9A9");


    private _featuresLength: number = 0;
    private _pointsLength: number = 0;
    private _trianglesLength: number = 0;
    private _geometryByteLength: number = 0;
    private _texturesByteLength: number = 0;
    private _batchTableByteLength: number = 0;

    private _innerContents?: IEarth3DTileContent[];
    private _batchTable?: Earth3DTileBatchTable;

    public get tile () {
        return this._tile;
    }

    public get tileset () {
        return this._tileset;
    }

    public get featurePropertiesDirty () {
        return this._featurePropertiesDirty;
    }

    public get readyPromise () {
        return this._readyPromise;
    }

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

    constructor (tileset: Earth3DTileset, tile: Earth3DTile, arrayBuffer: ArrayBuffer, byteOffset?: number) {
        this._tileset = tileset;
        this._tile = tile;
        this._featurePropertiesDirty = false;
        this._readyPromise = this.createReadyPromise();
        this._modelMatrix = this._tile.computedTransform.clone();
        this._projectedTransform = this._tile.computedTransform.clone();
        let initedRes = this.initialize(arrayBuffer, Utils.defaultValue(byteOffset, 0), this.getBatchTableLoaded(this));
        this.updateModelMatrix();
        this.projectPoints(initedRes);
    }

    private createNode () {
        // let node = Utils.createNodeWithName("pntsNode");
        // //默认不显示
        // node.active = false;
        // this._node = node;
        // return node;
    }

    private createReadyPromise () {
        return new Promise<IEarth3DTileContent>((resolve, reject) => {
            this._readyPromise_resolve = resolve;
            this._readyPromise_reject = reject;
        });
    }

    private initialize (arrayBuffer: ArrayBuffer, byteOffset: number, batchTableLoaded?: Function) {
        let uint8Array = new Uint8Array(arrayBuffer);
        let view = new DataView(arrayBuffer);
        byteOffset += sizeOfUint32; // Skip magic

        let version = view.getUint32(byteOffset, true);
        if (version !== 1) {
            this.log.error(
                "Only Point Cloud tile version 1 is supported.  Version " +
                version +
                " is not."
            );
        }
        byteOffset += sizeOfUint32;

        // Skip byteLength
        byteOffset += sizeOfUint32;

        let featureTableJsonByteLength = view.getUint32(byteOffset, true);
        if (featureTableJsonByteLength === 0) {
            this.log.error(
                "Feature table must have a byte length greater than zero"
            );
        }
        byteOffset += sizeOfUint32;

        let featureTableBinaryByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let batchTableJsonByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;
        let batchTableBinaryByteLength = view.getUint32(byteOffset, true);
        byteOffset += sizeOfUint32;

        let featureTableJson = getJsonFromTypedArray(
            uint8Array,
            byteOffset,
            featureTableJsonByteLength
        );
        byteOffset += featureTableJsonByteLength;

        let featureTableBinary = new Uint8Array(
            arrayBuffer,
            byteOffset,
            featureTableBinaryByteLength
        );
        byteOffset += featureTableBinaryByteLength;

        // Get the batch table JSON and binary
        let batchTableJson;
        let batchTableBinary;
        if (batchTableJsonByteLength > 0) {
            // Has a batch table JSON
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
                byteOffset += batchTableBinaryByteLength;
            }
        }

        let featureTable = new Earth3DTileFeatureTable(
            featureTableJson,
            featureTableBinary
        );

        let pointsLength = featureTable.getGlobalProperty("POINTS_LENGTH");
        featureTable.featuresLength = pointsLength;

        if (!Utils.defined(pointsLength)) {
            this.log.error(
                "Feature table global property: POINTS_LENGTH must be defined"
            );
        }

        let rtcCenter = featureTable.getGlobalProperty(
            "RTC_CENTER",
            ComponentDatatype.FLOAT,
            3
        );
        if (Utils.defined(rtcCenter)) {
            this._rtcCenter = Cartesian3.unpack(rtcCenter);
        }

        let positions;
        let colors;
        let normals;
        let batchIds;

        let hasPositions = false;
        let hasColors = false;
        let hasNormals = false;
        let hasBatchIds = false;

        let isQuantized = false;
        let isTranslucent = false;
        let isRGB565 = false;
        let isOctEncoded16P = false;

        let dracoBuffer;
        let dracoFeatureTableProperties;
        let dracoBatchTableProperties;

        let featureTableDraco = Utils.defined(featureTableJson.extensions) ?
            featureTableJson.extensions["3DTILES_draco_point_compression"] :
            undefined;
        let batchTableDraco =
            Utils.defined(batchTableJson) && Utils.defined(batchTableJson.extensions) ?
                batchTableJson.extensions["3DTILES_draco_point_compression"] :
                undefined;

        if (Utils.defined(batchTableDraco)) {
            dracoBatchTableProperties = batchTableDraco.properties;
        }

        if (Utils.defined(featureTableDraco)) {
            dracoFeatureTableProperties = featureTableDraco.properties;
            let dracoByteOffset = featureTableDraco.byteOffset;
            let dracoByteLength = featureTableDraco.byteLength;
            if (
                !Utils.defined(dracoFeatureTableProperties) ||
                !Utils.defined(dracoByteOffset) ||
                !Utils.defined(dracoByteLength)
            ) {
                this.log.error(
                    "Draco properties, byteOffset, and byteLength must be defined"
                );
            }
            dracoBuffer = arraySlice(
                featureTableBinary,
                dracoByteOffset,
                dracoByteOffset + dracoByteLength
            );
            hasPositions = Utils.defined(dracoFeatureTableProperties.POSITION);
            hasColors =
                Utils.defined(dracoFeatureTableProperties.RGB) ||
                Utils.defined(dracoFeatureTableProperties.RGBA);
            hasNormals = Utils.defined(dracoFeatureTableProperties.NORMAL);
            hasBatchIds = Utils.defined(dracoFeatureTableProperties.BATCH_ID);
            isTranslucent = Utils.defined(dracoFeatureTableProperties.RGBA);
            this._decodingState = DecodingState.NEEDS_DECODE;
        }

        let draco;
        if (Utils.defined(dracoBuffer)) {
            draco = {
                buffer: dracoBuffer,
                featureTableProperties: dracoFeatureTableProperties,
                batchTableProperties: dracoBatchTableProperties,
                properties: Utils.combine(
                    dracoFeatureTableProperties,
                    dracoBatchTableProperties
                ),
                dequantizeInShader: this._dequantizeInShader,
            };
        }

        if (!hasPositions) {
            if (Utils.defined(featureTableJson.POSITION)) {
                positions = featureTable.getPropertyArray(
                    "POSITION",
                    ComponentDatatype.FLOAT,
                    3
                );
                hasPositions = true;
            } else if (Utils.defined(featureTableJson.POSITION_QUANTIZED)) {
                positions = featureTable.getPropertyArray(
                    "POSITION_QUANTIZED",
                    ComponentDatatype.UNSIGNED_SHORT,
                    3
                );
                isQuantized = true;
                hasPositions = true;

                let quantizedVolumeScale = featureTable.getGlobalProperty(
                    "QUANTIZED_VOLUME_SCALE",
                    ComponentDatatype.FLOAT,
                    3
                );
                if (!Utils.defined(quantizedVolumeScale)) {
                    this.log.error(
                        "Global property: QUANTIZED_VOLUME_SCALE must be defined for quantized positions."
                    );
                }
                this._quantizedVolumeScale = Cartesian3.unpack(
                    quantizedVolumeScale
                );
                this._quantizedRange = (1 << 16) - 1;

                let quantizedVolumeOffset = featureTable.getGlobalProperty(
                    "QUANTIZED_VOLUME_OFFSET",
                    ComponentDatatype.FLOAT,
                    3
                );
                if (!Utils.defined(quantizedVolumeOffset)) {
                    this.log.error(
                        "Global property: QUANTIZED_VOLUME_OFFSET must be defined for quantized positions."
                    );
                }
                this._quantizedVolumeOffset = Cartesian3.unpack(
                    quantizedVolumeOffset
                );
            }
        }

        if (!hasColors) {
            if (Utils.defined(featureTableJson.RGBA)) {
                colors = featureTable.getPropertyArray(
                    "RGBA",
                    ComponentDatatype.UNSIGNED_BYTE,
                    4
                );
                isTranslucent = true;
                hasColors = true;
            } else if (Utils.defined(featureTableJson.RGB)) {
                colors = featureTable.getPropertyArray(
                    "RGB",
                    ComponentDatatype.UNSIGNED_BYTE,
                    3
                );
                hasColors = true;
            } else if (Utils.defined(featureTableJson.RGB565)) {
                colors = featureTable.getPropertyArray(
                    "RGB565",
                    ComponentDatatype.UNSIGNED_SHORT,
                    1
                );
                isRGB565 = true;
                hasColors = true;
            }
        }

        if (!hasNormals) {
            if (Utils.defined(featureTableJson.NORMAL)) {
                normals = featureTable.getPropertyArray(
                    "NORMAL",
                    ComponentDatatype.FLOAT,
                    3
                );
                hasNormals = true;
            } else if (Utils.defined(featureTableJson.NORMAL_OCT16P)) {
                normals = featureTable.getPropertyArray(
                    "NORMAL_OCT16P",
                    ComponentDatatype.UNSIGNED_BYTE,
                    2
                );
                isOctEncoded16P = true;
                hasNormals = true;
            }
        }

        if (!hasBatchIds) {
            if (Utils.defined(featureTableJson.BATCH_ID)) {
                batchIds = featureTable.getPropertyArray(
                    "BATCH_ID",
                    ComponentDatatype.UNSIGNED_SHORT,
                    1
                );
                hasBatchIds = true;
            }
        }

        if (!hasPositions) {
            this.log.error(
                "Either POSITION or POSITION_QUANTIZED must be defined."
            );
        }

        if (Utils.defined(featureTableJson.CONSTANT_RGBA)) {
            var constantRGBA = featureTable.getGlobalProperty(
                "CONSTANT_RGBA",
                ComponentDatatype.UNSIGNED_BYTE,
                4
            );
            // this._constantColor = Color.fromArray(
            //     [Utils.defaultValue(constantRGBA[0], 255.0) / 255.0,
            //     Utils.defaultValue(constantRGBA[1], 255.0) / 255.0,
            //     Utils.defaultValue(constantRGBA[2], 255.0) / 255.0,
            //     Utils.defaultValue(constantRGBA[3], 255.0) / 255.0],
            //     this._constantColor
            // );
            this._constantColor = new Color().setRGB(
                Utils.defaultValue(constantRGBA[0], 255.0) / 255.0,
                Utils.defaultValue(constantRGBA[1], 255.0) / 255.0,
                Utils.defaultValue(constantRGBA[2], 255.0) / 255.0
            )
        }

        if (hasBatchIds) {
            var batchLength = featureTable.getGlobalProperty("BATCH_LENGTH");
            if (!Utils.defined(batchLength)) {
                this.log.error(
                    "Global property: BATCH_LENGTH must be defined when BATCH_ID is defined."
                );
            }

            if (Utils.defined(batchTableBinary)) {
                // Copy the batchTableBinary section and let the underlying ArrayBuffer be freed
                //@ts-ignore
                batchTableBinary = new Uint8Array(batchTableBinary);
            }

            if (Utils.defined(batchTableLoaded)) {
                batchTableLoaded!(
                    batchLength,
                    batchTableJson,
                    batchTableBinary
                );
            }
        }

        // If points are not batched and there are per-point properties, use these properties for styling purposes
        let styleableProperties;
        if (!hasBatchIds && Utils.defined(batchTableBinary)) {
            styleableProperties = Earth3DTileBatchTable.getBinaryProperties(
                pointsLength,
                batchTableJson,
                batchTableBinary
            );
        }

        return {
            positions: positions,
            pointsLength: pointsLength,
            colors: colors,
            normals: normals,
            batchIds: batchIds,
            styleableProperties: styleableProperties,
            draco: draco
        }

    }

    private updateModelMatrix () {
        if (Utils.defined(this._rtcCenter)) {
            Matrix4Utils.multiplyByTranslation(this._modelMatrix, this._rtcCenter!, this._modelMatrix);
        }
        if (Utils.defined(this._quantizedVolumeOffset)) {
            Matrix4Utils.multiplyByTranslation(this._modelMatrix, this._quantizedVolumeOffset!, this._modelMatrix);
        }

        Matrix4Utils.clone(this._modelMatrix, this._projectedTransform);

        let tilingScheme = this._tileset.tilingScheme;
        let projection = tilingScheme.projection;
        let translation = new Cartesian4(this._modelMatrix.elements[12], this._modelMatrix.elements[13], this._modelMatrix.elements[14], this._modelMatrix.elements[15]);
        if (!Cartesian4.equals(translation, Cartesian4.UNIT_W)) {
            Transform.basisTo2D(projection, this._modelMatrix, this._modelMatrix);
        }

        if (this.tileset.gltfUpAxis === Earth3DTilesetGltfUpAxis.Z) {
            Matrix4Utils.multiplyTransformation(this._modelMatrix, Axis.Z_UP_TO_Y_UP, this._modelMatrix);
        }

        this._modelMatrix.scale(Transform.getMetersScale());

        scratchCartesian3.x = this._modelMatrix.elements[12];
        scratchCartesian3.y = this._modelMatrix.elements[13];
        scratchCartesian3.z = this._modelMatrix.elements[14];
        Transform.wgs84ToCartesian(tilingScheme.projection, scratchCartesian3, this.tileset.coordinateOffsetType, scratchCartesian3);
        let cCar = scratchCartesian3;
        let wVec = Transform.earthCar3ToWorldVec3(cCar, scratchVec3);

        //贴地处理
        // if (this.tileset.clampToGround) {
        //     wVec.y = 0;
        // }

        Matrix4Utils.setTranslation(this._modelMatrix, wVec, this._modelMatrix);

        // this._node = this.createNode();
        // this._node.matrix = this._modelMatrix;
    }

    /**
     * 重投影点
     * @param positions 
     */
    private projectPoints (initedRes: any) {
        ProjectWorker.instance.projectPointCloudPoints(initedRes.positions, this._projectedTransform, this.tileset.coordinateOffsetType, this._tileset.gltfUpAxis, initedRes.colors, this._quantizedRange, this._quantizedVolumeScale, this._quantizedVolumeOffset).then((result: any) => {
            let allPos: number[] = [];
            for (let k in result.pos) {
                let posArr = result.pos[k];
                let vArr: number[] = [];
                for (let i = 0; i < posArr.length; i++) {
                    const pos = posArr[i];
                    allPos.push(pos[0], pos[1], pos[2]);
                    vArr.push(pos[0], pos[1], pos[2]);
                }

                //用以下方案解决 会导致drawCall巨高

                // let meshRender = this._node!.addComponent(MeshRenderer);
                // meshRender.mesh = PointCloudMesh.fromPositions(vArr);
                // meshRender.setMaterial(this._material!, 0);
                // const h = meshRender.material!.passes[0].getHandle('color');
                // let c = result.color[k];
                // let color = new Color(c[0], c[1], c[2], Utils.defined(c[3]) ? c[3] : 255);
                // meshRender.material!.passes[0].setUniform(h, color);
                // vArr.length = 0;
            }


            // let meshRender = this._node!.addComponent(MeshRenderer);
            // meshRender.mesh = PointCloudMesh.fromPositions(allPos);
            // meshRender.setMaterial(this._material!, 0);


            delete result.pos;
            delete result.color;
            allPos.length = 0;
            this._readyPromise_resolve!(this);
        }).catch(error => {
            this.log.error("project point cloud failed:", error);
        });
    }

    private getBatchTableLoaded (content: PointCloud3DTileContent) {
        return function (batchLength: number, batchTableJson: any, batchTableBinary: any) {
            content._batchTable = new Earth3DTileBatchTable(
                content,
                batchLength,
                batchTableJson,
                batchTableBinary
            );
        };
    }

    /**
     * 获取几何误差
     * @returns 
     */
    private getGeometricError () {
        let pointCloudShading = this._tileset.pointCloudShading;
        let sphereVolume = this._tile.contentBoundingVolume.boundingSphereVolume;
        let baseResolutionApproximation = math.cbrt(
            sphereVolume / this.pointsLength
        );
        let geometricError = this._tile.geometricError;
        if (geometricError === 0) {
            if (
                Utils.defined(pointCloudShading) &&
                Utils.defined(pointCloudShading!.baseResolution)
            ) {
                geometricError = pointCloudShading!.baseResolution!;
            } else {
                geometricError = baseResolutionApproximation;
            }
        }
        return geometricError;
    }

    private decode (arrayBuffer: Uint8Array) {
        if (this._decodingState === DecodingState.NEEDS_DECODE) {
            this._decodingState = DecodingState.DECODING;
            DracoWorker.instance.decodePointCloud(arrayBuffer).then((result) => {
                this.log.info(result);
                this._decodingState = DecodingState.READY;
            }).catch(error => {
                this._decodingState = DecodingState.FAILED;
                this.log.error("draco decode point cloud failed: ", error);
            });
        }
    }

    public update (tileset: Earth3DTileset, frameState: FrameState): void {
        let pointCloudShading = Utils.defaultValue(tileset.pointCloudShading, defaultShading);
        let tile = this._tile;
        let boundingSphere;
        if (Utils.defined(tile.contentBoundingVolume)) {
            boundingSphere = tile.contentContentBoundingVolume2D!.boundingSphere;
        } else {
            boundingSphere = tile.boundingVolume.boundingSphere;
        }
    }

    public show (tileset: Earth3DTileset): void {
        // if (!this._node!.parent) {
        //     this._node!.parent = tileset.node;
        // }
        // if (!this._node!.active) {
        //     this._node!.active = true;
        // }
    }
    public hide (tileset: Earth3DTileset): void {
        // if (this._node!.parent) {
        //     this._node!.removeFromParent();
        // }
        // if (this._node!.active) {
        //     this._node!.active = false;
        // }
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
        this.releaseNodeResource(true);
        this._texturesByteLength = 0;
        this._geometryByteLength = 0;
        this._batchTableByteLength = 0;
    }




}
