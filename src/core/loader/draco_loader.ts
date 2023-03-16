import {
    BufferAttribute,
    BufferGeometry,
    Color,
    Loader,
    LoadingManager
} from 'three';
import { Utils } from '../utils/utils';
import { DracoGeometry, DracoWorker } from '../worker/draco_worker';
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

    private decoderPending: Promise<any> = null;

    private workerLimit: number = 4;

    private _workerPool?: DracokWorkerPool;

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

    public constructor (manager?: LoadingManager) {

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


        // Obtain a worker and assign a task, and construct a geometry instance
        // when the task completes.
        const geometryPending = this._getWorker()
            .then(worker => {

                return worker.decode(buffer, taskConfig);


            })
            .then((geometry) => {
                return this._createGeometry(geometry);
            });

        // Remove task from the task list.
        // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
        geometryPending
            .catch(() => true)
            .then(() => {

                // if (worker && taskID) {

                //     this._releaseTask(worker, taskID);

                //     // this.debug();

                // }

            });

        // Cache the task result.
        _taskCache.set(buffer, {

            key: taskKey,
            promise: geometryPending

        });

        return geometryPending;

    }

    private _createGeometry (geometryData: DracoGeometry) {

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

                //init wokerPool
                this._workerPool = new DracokWorkerPool(jsContent, this.decoderConfig, this.workerLimit);


                // const fn = DRACOWorker.toString();

                // const body = [
                //     '/* draco decoder */',
                //     jsContent,
                //     '',
                //     '/* worker */',
                //     fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
                // ].join('\n');

                // this.workerSourceURL = URL.createObjectURL(new Blob([body]));

            });

        return this.decoderPending;

    }

    private _getWorker () {
        return new Promise<DracoWorker>((resolve, reject) => {
            this._initDecoder().then(() => {
                resolve(this._workerPool.getInstance());
            }).catch(reject);
        });
    }

    _releaseTask (worker, taskID) {

        worker._taskLoad -= worker._taskCosts[taskID];
        delete worker._callbacks[taskID];
        delete worker._taskCosts[taskID];

    }


    public dispose () {

        if (this._workerPool) {
            this._workerPool.dispose();
            this._workerPool = null;
        }

        return this;

    }

}


