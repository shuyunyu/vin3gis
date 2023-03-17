import { BaseWorker } from "./base_worker";
import { TaskProcessor } from "./task_processor";

type InputParams = {
    type: 'init' | 'decode',
    buffer?: ArrayBuffer;
    decoderConfig?: Record<string, any>,
    taskConfig?: Record<string, any>;
}

export type DracoGeometry = {
    index: {
        array: number[];
    };
    attributes: {
        name: string;
        array: number[];
        itemSize: number;
        vertexColorSpace: number;
    }[]
}

export class DracoWorker extends BaseWorker {

    protected _taskProcessor: TaskProcessor<InputParams, DracoGeometry>;

    private _jsContent: string;

    private _decoderConfig: Record<string, any>;

    private _inited: boolean;

    public constructor (jsContent: string, decoderConfig: Record<string, any>) {
        super();
        this._jsContent = jsContent;
        this._decoderConfig = decoderConfig;
        this._inited = false;
    }

    private init () {
        if (this._inited) return;
        this._inited = true;
        this._taskProcessor = new TaskProcessor(this.getWorkerScript());
        //post init message
        this._taskProcessor.scheduleTask({ type: 'init', decoderConfig: this._decoderConfig }, null);
    }

    private getWorkerScript () {
        const fn = DRACOWorkerFunc.toString();
        const body = [
            '/* draco decoder */',
            this._jsContent,
            '',
            '/* worker */',
            fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
        ].join('\n');
        return body;
    }

    public decode (buffer: ArrayBuffer, taskConfig: Record<string, any>) {
        this.init();
        return new Promise<DracoGeometry>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                type: 'decode',
                buffer: buffer,
                taskConfig: taskConfig
            }, [buffer]).then((res: DracoGeometry) => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
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
                decoderPending.then((module) => {

                    const draco = module.draco;
                    const decoder = new draco.Decoder();

                    try {

                        const geometry = decodeGeometry(draco, decoder, new Int8Array(buffer), taskConfig);

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

}