import {
    BufferAttribute,
    BufferGeometry,
    Color,
    Loader,
    LinearSRGBColorSpace,
    SRGBColorSpace,
    LoadingManager
} from 'three';
import { Utils } from '../utils/utils';
import { DracokWorkerPool } from '../worker/pool/draco_worker_pool';
import { XHRResponseType } from '../xhr/xhr_request';
import { FileLoader } from './file_loader';

const _taskCache = new WeakMap();

type onLoad = (geometry: BufferGeometry) => void;

type onProgress = (total: number, loaded: number) => void;

type onError = (err: any) => void;

enum VertexColorSpace {
    SRGBColorSpace = 0,
    LinearSRGBColorSpace = 1
}

export class DRACOLoader extends Loader {

    private decoderPath: string = '';

    private decoderConfig: Record<string, any> = {};

    private decoderBinary: any = null;

    private decoderPending: any = null;

    private workerLimit: number = 4;

    private _workerPool?: DracokWorkerPool;

    private workerNextTaskID: number = 1;

    private workerSourceURL: string = '';

    private defaultAttributeIDs = {
        position: 'POSITION',
        normal: 'NORMAL',
        color: 'COLOR',
        uv: 'TEX_COORD'
    };

    private defaultAttributeTypes = {
        position: 'Float32Array',
        normal: 'Float32Array',
        color: 'Float32Array',
        uv: 'Float32Array'
    };

    public constructor (manager: LoadingManager) {

        super(manager);

    }

    public setDecoderPath (path: string) {

        this.decoderPath = path;

        return this;

    }

    public setDecoderConfig (config: Record<string, any>) {

        this.decoderConfig = config;

        return this;

    }

    public setWorkerLimit (workerLimit: number) {
        if (Utils.defined(this._workerPool)) {
            console.warn(`can not change workerLimit after execute load.`);
            return this;
        }
        this.workerLimit = workerLimit;

        return this;

    }

    public load (url: string, onLoad: onLoad, onProgress?: onProgress, onError?: onError) {

        const loader = new FileLoader(this.manager);

        loader.setPath(this.path);
        loader.setResponseType(XHRResponseType.ARRAYBUFFER);
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(this.withCredentials);
        loader.setLoadInWorker(true);

        loader.load(url, (buffer: ArrayBuffer) => {

            this.parse(buffer, onLoad, onError);

        }, onProgress, onError);

    }

    public parse (buffer: ArrayBuffer, onLoad: onLoad, onError?: onError) {

        this.decodeDracoFile(buffer, onLoad, null, null, VertexColorSpace.SRGBColorSpace).catch(onError);

    }

    public decodeDracoFile (buffer: ArrayBuffer, callback, attributeIDs, attributeTypes, vertexColorSpace = VertexColorSpace.LinearSRGBColorSpace) {

        const taskConfig = {
            attributeIDs: attributeIDs || this.defaultAttributeIDs,
            attributeTypes: attributeTypes || this.defaultAttributeTypes,
            useUniqueIDs: !!attributeIDs,
            vertexColorSpace: vertexColorSpace,
        };

        return this.decodeGeometry(buffer, taskConfig).then(callback);

    }

    public decodeGeometry (buffer: ArrayBuffer, taskConfig: Record<string, any>) {

        const taskKey = JSON.stringify(taskConfig);

        // Check for an existing task using this buffer. A transferred buffer cannot be transferred
        // again from this thread.
        if (_taskCache.has(buffer)) {

            const cachedTask = _taskCache.get(buffer);

            if (cachedTask.key === taskKey) {

                return cachedTask.promise;

            } else if (buffer.byteLength === 0) {

                // Technically, it would be possible to wait for the previous task to complete,
                // transfer the buffer back, and decode again with the second configuration. That
                // is complex, and I don't know of any reason to decode a Draco buffer twice in
                // different ways, so this is left unimplemented.
                throw new Error(

                    'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
                    'settings. Buffer has already been transferred.'

                );

            }

        }

        //

        let worker;
        const taskID = this.workerNextTaskID++;
        const taskCost = buffer.byteLength;

        // Obtain a worker and assign a task, and construct a geometry instance
        // when the task completes.
        const geometryPending = this._getWorker(taskID, taskCost)
            .then((_worker) => {

                worker = _worker;

                return new Promise((resolve, reject) => {

                    worker._callbacks[taskID] = { resolve, reject };

                    worker.postMessage({ type: 'decode', id: taskID, taskConfig, buffer }, [buffer]);

                    // this.debug();

                });

            })
            .then((message) => this._createGeometry(message.geometry));

        // Remove task from the task list.
        // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
        geometryPending
            .catch(() => true)
            .then(() => {

                if (worker && taskID) {

                    this._releaseTask(worker, taskID);

                    // this.debug();

                }

            });

        // Cache the task result.
        _taskCache.set(buffer, {

            key: taskKey,
            promise: geometryPending

        });

        return geometryPending;

    }

    _createGeometry (geometryData) {

        const geometry = new BufferGeometry();

        if (geometryData.index) {

            geometry.setIndex(new BufferAttribute(geometryData.index.array, 1));

        }

        for (let i = 0; i < geometryData.attributes.length; i++) {

            const result = geometryData.attributes[i];
            const name = result.name;
            const array = result.array;
            const itemSize = result.itemSize;

            const attribute = new BufferAttribute(array, itemSize);

            if (name === 'color') {

                this._assignVertexColorSpace(attribute, result.vertexColorSpace);

            }

            geometry.setAttribute(name, attribute);

        }

        return geometry;

    }

    _assignVertexColorSpace (attribute, inputColorSpace) {

        // While .drc files do not specify colorspace, the only 'official' tooling
        // is PLY and OBJ converters, which use sRGB. We'll assume sRGB when a .drc
        // file is passed into .load() or .parse(). GLTFLoader uses internal APIs
        // to decode geometry, and vertex colors are already Linear-sRGB in there.

        if (inputColorSpace !== VertexColorSpace.SRGBColorSpace) return;

        const _color = new Color();

        for (let i = 0, il = attribute.count; i < il; i++) {

            _color.fromBufferAttribute(attribute, i).convertSRGBToLinear();
            attribute.setXYZ(i, _color.r, _color.g, _color.b);

        }

    }

    private _loadLibrary (url: string, responseType: XHRResponseType.TEXT | XHRResponseType.ARRAYBUFFER) {

        const loader = new FileLoader(this.manager);
        loader.setPath(this.decoderPath);
        loader.setResponseType(responseType);
        loader.setWithCredentials(this.withCredentials);
        loader.setLoadInWorker(true);

        return new Promise((resolve, reject) => {

            loader.load(url, resolve, undefined, reject);

        });

    }

    public preload () {

        this._initDecoder();

        return this;

    }

    private _initDecoder () {

        if (this.decoderPending) return this.decoderPending;

        const useJS = typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js';
        const librariesPending = [];

        if (useJS) {

            librariesPending.push(this._loadLibrary('draco_decoder.js', XHRResponseType.TEXT));

        } else {

            librariesPending.push(this._loadLibrary('draco_wasm_wrapper.js', XHRResponseType.TEXT));
            librariesPending.push(this._loadLibrary('draco_decoder.wasm', XHRResponseType.ARRAYBUFFER));

        }

        this.decoderPending = Promise.all(librariesPending)
            .then((libraries) => {

                const jsContent = libraries[0];

                if (!useJS) {

                    this.decoderConfig.wasmBinary = libraries[1];

                }

                const fn = DRACOWorker.toString();

                const body = [
                    '/* draco decoder */',
                    jsContent,
                    '',
                    '/* worker */',
                    fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
                ].join('\n');

                this.workerSourceURL = URL.createObjectURL(new Blob([body]));

            });

        return this.decoderPending;

    }

    _getWorker (taskID, taskCost) {

        return this._initDecoder().then(() => {

            if (this.workerPool.length < this.workerLimit) {

                const worker = new Worker(this.workerSourceURL);

                worker._callbacks = {};
                worker._taskCosts = {};
                worker._taskLoad = 0;

                worker.postMessage({ type: 'init', decoderConfig: this.decoderConfig });

                worker.onmessage = function (e) {

                    const message = e.data;

                    switch (message.type) {

                        case 'decode':
                            worker._callbacks[message.id].resolve(message);
                            break;

                        case 'error':
                            worker._callbacks[message.id].reject(message);
                            break;

                        default:
                            console.error('THREE.DRACOLoader: Unexpected message, "' + message.type + '"');

                    }

                };

                this.workerPool.push(worker);

            } else {

                this.workerPool.sort(function (a, b) {

                    return a._taskLoad > b._taskLoad ? - 1 : 1;

                });

            }

            const worker = this.workerPool[this.workerPool.length - 1];
            worker._taskCosts[taskID] = taskCost;
            worker._taskLoad += taskCost;
            return worker;

        });

    }

    _releaseTask (worker, taskID) {

        worker._taskLoad -= worker._taskCosts[taskID];
        delete worker._callbacks[taskID];
        delete worker._taskCosts[taskID];

    }

    public debug () {

        console.log('Task load: ', this.workerPool.map((worker) => worker._taskLoad));

    }

    public dispose () {

        for (let i = 0; i < this.workerPool.length; ++i) {

            this.workerPool[i].terminate();

        }

        this.workerPool.length = 0;

        if (this.workerSourceURL !== '') {

            URL.revokeObjectURL(this.workerSourceURL);

        }

        return this;

    }

}


