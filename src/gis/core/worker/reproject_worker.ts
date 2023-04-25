import { Mesh } from "three";
import { DRACOLoader } from "../../../core/loader/draco_loader.js";
import { DracoWorker } from "../../../core/worker/draco_worker.js";
import { DracokWorkerPool } from "../../../core/worker/pool/draco_worker_pool.js";
import TransformWorker from "./transform_worker.js";

//把打包进去的THREE对象都替换掉
const transformWorkerStr = (TransformWorker as string).replace(/THREE/g, '{}')

/**
 * 重投影Worker
 */
class ReprojectWorker {

    //重投影mesh
    public reprojectMesh (mesh: Mesh) {

    }

}

/* WEB WORKER */

function DRACOWorkerFunc () {

    let decoderConfig;
    let decoderPending;

    onmessage = function (event) {
        const data = event.data;
        const params = event.data.params;
        // debugger

        handleMessage(data, params);

    };

    function handleMessage (data, params) {
        switch (params.type) {

            case 'init':
                decoderConfig = params.decoderConfig;
                decoderPending = new Promise(function (resolve/*, reject*/) {

                    decoderConfig.onModuleLoaded = function (draco) {

                        // Module is Promise-like. Wrap before resolving to avoid loop.
                        resolve({ draco: draco });

                    };
                    //@ts-ignore
                    DracoDecoderModule(decoderConfig); // eslint-disable-line no-undef

                });
                break;

            case 'decode':
                const buffer = params.buffer;
                const taskConfig = params.taskConfig;
                const gltfUpAxis = params.gltfUpAxis;
                decoderPending.then((module) => {

                    const draco = module.draco;
                    const decoder = new draco.Decoder();

                    try {

                        const geometry = decodeGeometry(draco, decoder, new Int8Array(buffer), taskConfig);
                        //@ts-ignore
                        reprojectGeometry(geometry, transform_worker.gltfUpAxis.Z, transform_worker.webMercatorProjection);
                        const buffers = geometry.attributes.map((attr) => attr.array.buffer);

                        if (geometry.index) buffers.push(geometry.index.array.buffer);

                        // self.postMessage({ type: 'decode', id: message.id, geometry }, buffers);
                        self.postMessage({
                            id: data.id,
                            error: null,
                            result: geometry
                            //@ts-ignore
                        }, buffers);

                    } catch (error) {

                        console.error(error);

                        // self.postMessage({ type: 'error', id: message.id, error: error.message });
                        self.postMessage({
                            id: data.id,
                            error: error.message,
                            result: null
                        });

                    } finally {

                        draco.destroy(decoder);

                    }

                });
                break;

        }
    }

    function decodeGeometry (draco, decoder, array, taskConfig) {

        const attributeIDs = taskConfig.attributeIDs;
        const attributeTypes = taskConfig.attributeTypes;

        let dracoGeometry;
        let decodingStatus;

        const geometryType = decoder.GetEncodedGeometryType(array);

        if (geometryType === draco.TRIANGULAR_MESH) {

            dracoGeometry = new draco.Mesh();
            decodingStatus = decoder.DecodeArrayToMesh(array, array.byteLength, dracoGeometry);

        } else if (geometryType === draco.POINT_CLOUD) {

            dracoGeometry = new draco.PointCloud();
            decodingStatus = decoder.DecodeArrayToPointCloud(array, array.byteLength, dracoGeometry);

        } else {

            throw new Error('THREE.DRACOLoader: Unexpected geometry type.');

        }

        if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {

            throw new Error('THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg());

        }

        const geometry = { index: null, attributes: [] };

        // Gather all vertex attributes.
        for (const attributeName in attributeIDs) {

            const attributeType = self[attributeTypes[attributeName]];

            let attribute;
            let attributeID;

            // A Draco file may be created with default vertex attributes, whose attribute IDs
            // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
            // a Draco file may contain a custom set of attributes, identified by known unique
            // IDs. glTF files always do the latter, and `.drc` files typically do the former.
            if (taskConfig.useUniqueIDs) {

                attributeID = attributeIDs[attributeName];
                attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);

            } else {

                attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);

                if (attributeID === - 1) continue;

                attribute = decoder.GetAttribute(dracoGeometry, attributeID);

            }

            const attributeResult = decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute);

            if (attributeName === 'color') {
                //@ts-ignore
                attributeResult.vertexColorSpace = taskConfig.vertexColorSpace;

            }

            geometry.attributes.push(attributeResult);

        }

        // Add index.
        if (geometryType === draco.TRIANGULAR_MESH) {

            geometry.index = decodeIndex(draco, decoder, dracoGeometry);

        }

        draco.destroy(dracoGeometry);

        return geometry;

    }

    function decodeIndex (draco, decoder, dracoGeometry) {

        const numFaces = dracoGeometry.num_faces();
        const numIndices = numFaces * 3;
        const byteLength = numIndices * 4;

        const ptr = draco._malloc(byteLength);
        decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
        const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice();
        draco._free(ptr);

        return { array: index, itemSize: 1 };

    }

    function decodeAttribute (draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {

        const numComponents = attribute.num_components();
        const numPoints = dracoGeometry.num_points();
        const numValues = numPoints * numComponents;
        const byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
        const dataType = getDracoDataType(draco, attributeType);

        const ptr = draco._malloc(byteLength);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr);
        const array = new attributeType(draco.HEAPF32.buffer, ptr, numValues).slice();
        draco._free(ptr);

        return {
            name: attributeName,
            array: array,
            itemSize: numComponents
        };

    }

    function getDracoDataType (draco, attributeType) {

        switch (attributeType) {

            case Float32Array: return draco.DT_FLOAT32;
            case Int8Array: return draco.DT_INT8;
            case Int16Array: return draco.DT_INT16;
            case Int32Array: return draco.DT_INT32;
            case Uint8Array: return draco.DT_UINT8;
            case Uint16Array: return draco.DT_UINT16;
            case Uint32Array: return draco.DT_UINT32;

        }

    }

    /**
     * geometry重投影
     * @param geometry
     */
    function reprojectGeometry (geometry, gltfUpAxis, projection, coordinateOffsetType, transformArray) {
        return
        //@ts-ignore
        const transform = transform_worker.fromArray(transformArray);
        const reprojectAttrs = geometry.attributes.filter(attr => attr.name === "position" || attr.name === "normal");
        if (!reprojectAttrs || !reprojectAttrs.length) return;
        //@ts-ignore
        let scratchCartesian_0 = new transform_worker.Cartesian3();
        //@ts-ignore
        let scratchCartesian_1 = new transform_worker.Cartesian3();
        reprojectAttrs.forEach(attr => {
            const buffer = attr.array as Float32Array;
            for (let i = 0; i < buffer.length; i += 3) {
                const x = buffer[i];
                const y = buffer[i + 1];
                const z = buffer[i + 2];
                //@ts-ignore
                if (gltfUpAxis === transform_worker.gltfUpAxis.Z) {
                    scratchCartesian_0.x = x;
                    scratchCartesian_0.y = y;
                    scratchCartesian_0.z = z;
                    //@ts-ignore
                    let projected_pos = transform_worker.worker_transfrom.projectRtcCartesian3(projection, coordinateOffsetType, transform, scratchCartesian_0, scratchCartesian_1);
                    buffer[i] = projected_pos.x;
                    buffer[i + 1] = projected_pos.y;
                    buffer[i + 2] = projected_pos.z;
                    //@ts-ignore
                } else if (gltfUpAxis === transform_worker.gltfUpAxis.Y) {
                    scratchCartesian_0.x = x;
                    scratchCartesian_0.y = z;
                    scratchCartesian_0.z = y;
                    //@ts-ignore
                    let projected_pos = transform_worker.worker_transfrom.projectRtcCartesian3(projection, coordinateOffsetType, transform, scratchCartesian_0, scratchCartesian_1);
                    buffer[i] = projected_pos.x;
                    buffer[i + 1] = projected_pos.y;
                    buffer[i + 2] = projected_pos.z;
                }
            }
        });
    }

}

export const reprojectWorker = new ReprojectWorker();