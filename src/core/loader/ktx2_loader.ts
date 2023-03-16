/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats, as well as some
 * uncompressed DataTexture and Data3DTexture formats.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */

import {
    CompressedTexture,
    CompressedArrayTexture,
    Data3DTexture,
    DataTexture,
    FloatType,
    HalfFloatType,
    LinearEncoding,
    LinearFilter,
    LinearMipmapLinearFilter,
    Loader,
    RedFormat,
    RGBAFormat,
    RGFormat,
    sRGBEncoding,
    UnsignedByteType,
    LoadingManager,
    WebGLRenderer,
    Texture,
} from 'three';

import {
    read,
    KHR_DF_FLAG_ALPHA_PREMULTIPLIED,
    KHR_DF_TRANSFER_SRGB,
    KHR_SUPERCOMPRESSION_NONE,
    KHR_SUPERCOMPRESSION_ZSTD,
    VK_FORMAT_UNDEFINED,
    VK_FORMAT_R16_SFLOAT,
    VK_FORMAT_R16G16_SFLOAT,
    VK_FORMAT_R16G16B16A16_SFLOAT,
    VK_FORMAT_R32_SFLOAT,
    VK_FORMAT_R32G32_SFLOAT,
    VK_FORMAT_R32G32B32A32_SFLOAT,
    VK_FORMAT_R8_SRGB,
    VK_FORMAT_R8_UNORM,
    VK_FORMAT_R8G8_SRGB,
    VK_FORMAT_R8G8_UNORM,
    VK_FORMAT_R8G8B8A8_SRGB,
    VK_FORMAT_R8G8B8A8_UNORM,
} from '../libs/ktx-parse.module.js';
import { ZSTDDecoder } from '../libs/zstddec.module.js';
import { Utils } from '../utils/utils';
import { KTX2WorkerPool } from '../worker/pool/ktx2_worker_pool';
import { XHRResponseType } from '../xhr/xhr_request';
import { FileLoader } from './file_loader';

type OnLoad = (texture: Texture) => void;
type OnProgress = (total: number, loaded: number) => void;
type OnError = (err: any) => void;


const _taskCache = new WeakMap();

let _activeLoaders = 0;

let _zstd;

export class KTX2Loader extends Loader {

    public transcoderPath = '';
    public transcoderBinary?: ArrayBuffer = null;
    public transcoderPending = null;

    private workerLimit: number = 4;

    private workerConfig: Record<string, boolean>;

    private _workerPool?: KTX2WorkerPool;

    public constructor (manager?: LoadingManager) {

        super(manager);

        if (typeof globalThis.MSC_TRANSCODER !== 'undefined') {

            console.warn(

                'THREE.KTX2Loader: Please update to latest "basis_transcoder".'
                + ' "msc_basis_transcoder" is no longer supported in three.js r125+.'

            );

        }

    }

    public setTranscoderPath (path: string) {

        this.transcoderPath = path;

        return this;

    }

    public setWorkerLimit (num: number) {
        if (Utils.defined(this._workerPool)) {
            console.warn(`can not change workerLimit after execute init.`);
            return this;
        }
        this.workerLimit = num;

        return this;

    }

    public detectSupport (renderer: WebGLRenderer) {

        this.workerConfig = {
            astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
            etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
            etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
            dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
            bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
            pvrtcSupported: renderer.extensions.has('WEBGL_compressed_texture_pvrtc')
                || renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc')
        };


        if (renderer.capabilities.isWebGL2) {

            // https://github.com/mrdoob/three.js/pull/22928
            this.workerConfig.etc1Supported = false;

        }

        return this;

    }

    public init () {

        if (!this.transcoderPending) {

            // Load transcoder wrapper.
            const jsLoader = new FileLoader(this.manager);
            jsLoader.setPath(this.transcoderPath);
            jsLoader.setWithCredentials(this.withCredentials);
            jsLoader.setLoadInWorker(true);
            const jsContent = jsLoader.loadAsync('basis_transcoder.js');

            // Load transcoder WASM binary.
            const binaryLoader = new FileLoader(this.manager);
            binaryLoader.setPath(this.transcoderPath);
            binaryLoader.setResponseType(XHRResponseType.ARRAYBUFFER);
            binaryLoader.setWithCredentials(this.withCredentials);
            binaryLoader.setLoadInWorker(true);
            const binaryContent = binaryLoader.loadAsync('basis_transcoder.wasm');

            this.transcoderPending = Promise.all([jsContent, binaryContent])
                .then(([jsContent, binaryContent]) => {

                    this.transcoderBinary = binaryContent;
                    const transcoderBinary = this.transcoderBinary.slice(0);

                    this._workerPool = new KTX2WorkerPool(jsContent, this.workerConfig, this.workerLimit, transcoderBinary);

                });

            if (_activeLoaders > 0) {

                // Each instance loads a transcoder and allocates workers, increasing network and memory cost.

                console.warn(

                    'THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues.'
                    + ' Use a single KTX2Loader instance, or call .dispose() on old instances.'

                );

            }

            _activeLoaders++;

        }

        return this.transcoderPending;

    }

    public load (url: string, onLoad?: OnLoad, onProgress?: OnProgress, onError?: OnError) {

        if (this.workerConfig === null) {

            throw new Error('THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.');

        }

        const loader = new FileLoader(this.manager);

        loader.setResponseType(XHRResponseType.ARRAYBUFFER);
        loader.setWithCredentials(this.withCredentials);

        loader.load(url, (buffer: ArrayBuffer) => {

            // Check for an existing task using this buffer. A transferred buffer cannot be transferred
            // again from this thread.
            if (_taskCache.has(buffer)) {

                const cachedTask = _taskCache.get(buffer);

                return cachedTask.promise.then(onLoad).catch(onError);

            }

            this._createTexture(buffer)
                .then((texture) => onLoad ? onLoad(texture) : null)
                .catch(onError);

        }, onProgress, onError);

    }

    private _createTextureFrom (transcodeResult, container) {

        const { mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags } = transcodeResult;

        if (type === 'error') return Promise.reject(error);

        const texture = container.layerCount > 1
            ? new CompressedArrayTexture(mipmaps, width, height, container.layerCount, format, UnsignedByteType)
            : new CompressedTexture(mipmaps, width, height, format, UnsignedByteType);


        texture.minFilter = mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;

        texture.needsUpdate = true;
        texture.encoding = dfdTransferFn === KHR_DF_TRANSFER_SRGB ? sRGBEncoding : LinearEncoding;
        texture.premultiplyAlpha = !!(dfdFlags & KHR_DF_FLAG_ALPHA_PREMULTIPLIED);

        return texture;

    }

    /**
     * @param {ArrayBuffer} buffer
     * @param {object?} config
     * @return {Promise<CompressedTexture|CompressedArrayTexture|DataTexture|Data3DTexture>}
     */
    private async _createTexture (buffer: ArrayBuffer, config = {}): Promise<CompressedTexture | CompressedArrayTexture | DataTexture | Data3DTexture> {

        const container = read(new Uint8Array(buffer));

        if (container.vkFormat !== VK_FORMAT_UNDEFINED) {

            return createDataTexture(container);

        }

        //
        const taskConfig = config;
        const texturePending = this.init().then(() => {

            return this._workerPool.getInstance().transcode(buffer, taskConfig);

        }).then((data) => this._createTextureFrom(data, container));

        // Cache the task result.
        _taskCache.set(buffer, { promise: texturePending });

        return texturePending;

    }

    dispose () {

        if (this._workerPool) {
            this._workerPool.dispose();
            this._workerPool = null;
        }

        _activeLoaders--;

        return this;

    }

}


//
// DataTexture and Data3DTexture parsing.

const FORMAT_MAP = {

    [VK_FORMAT_R32G32B32A32_SFLOAT]: RGBAFormat,
    [VK_FORMAT_R16G16B16A16_SFLOAT]: RGBAFormat,
    [VK_FORMAT_R8G8B8A8_UNORM]: RGBAFormat,
    [VK_FORMAT_R8G8B8A8_SRGB]: RGBAFormat,

    [VK_FORMAT_R32G32_SFLOAT]: RGFormat,
    [VK_FORMAT_R16G16_SFLOAT]: RGFormat,
    [VK_FORMAT_R8G8_UNORM]: RGFormat,
    [VK_FORMAT_R8G8_SRGB]: RGFormat,

    [VK_FORMAT_R32_SFLOAT]: RedFormat,
    [VK_FORMAT_R16_SFLOAT]: RedFormat,
    [VK_FORMAT_R8_SRGB]: RedFormat,
    [VK_FORMAT_R8_UNORM]: RedFormat,

};

const TYPE_MAP = {

    [VK_FORMAT_R32G32B32A32_SFLOAT]: FloatType,
    [VK_FORMAT_R16G16B16A16_SFLOAT]: HalfFloatType,
    [VK_FORMAT_R8G8B8A8_UNORM]: UnsignedByteType,
    [VK_FORMAT_R8G8B8A8_SRGB]: UnsignedByteType,

    [VK_FORMAT_R32G32_SFLOAT]: FloatType,
    [VK_FORMAT_R16G16_SFLOAT]: HalfFloatType,
    [VK_FORMAT_R8G8_UNORM]: UnsignedByteType,
    [VK_FORMAT_R8G8_SRGB]: UnsignedByteType,

    [VK_FORMAT_R32_SFLOAT]: FloatType,
    [VK_FORMAT_R16_SFLOAT]: HalfFloatType,
    [VK_FORMAT_R8_SRGB]: UnsignedByteType,
    [VK_FORMAT_R8_UNORM]: UnsignedByteType,

};

const ENCODING_MAP = {

    [VK_FORMAT_R8G8B8A8_SRGB]: sRGBEncoding,
    [VK_FORMAT_R8G8_SRGB]: sRGBEncoding,
    [VK_FORMAT_R8_SRGB]: sRGBEncoding,

};

async function createDataTexture (container) {

    const { vkFormat, pixelWidth, pixelHeight, pixelDepth } = container;

    if (FORMAT_MAP[vkFormat] === undefined) {

        throw new Error('THREE.KTX2Loader: Unsupported vkFormat.');

    }

    const level = container.levels[0];

    let levelData;
    let view;

    if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_NONE) {

        levelData = level.levelData;

    } else if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_ZSTD) {

        if (!_zstd) {

            _zstd = new Promise(async (resolve) => {

                const zstd = new ZSTDDecoder();
                await zstd.init();
                resolve(zstd);

            });

        }

        levelData = (await _zstd).decode(level.levelData, level.uncompressedByteLength);

    } else {

        throw new Error('THREE.KTX2Loader: Unsupported supercompressionScheme.');

    }

    if (TYPE_MAP[vkFormat] === FloatType) {

        view = new Float32Array(

            levelData.buffer,
            levelData.byteOffset,
            levelData.byteLength / Float32Array.BYTES_PER_ELEMENT

        );

    } else if (TYPE_MAP[vkFormat] === HalfFloatType) {

        view = new Uint16Array(

            levelData.buffer,
            levelData.byteOffset,
            levelData.byteLength / Uint16Array.BYTES_PER_ELEMENT

        );

    } else {

        view = levelData;

    }
    //

    const texture = pixelDepth === 0
        ? new DataTexture(view, pixelWidth, pixelHeight)
        : new Data3DTexture(view, pixelWidth, pixelHeight, pixelDepth);

    texture.type = TYPE_MAP[vkFormat];
    texture.format = FORMAT_MAP[vkFormat];
    texture.encoding = ENCODING_MAP[vkFormat] || LinearEncoding;

    texture.needsUpdate = true;

    //

    return Promise.resolve(texture);

}
