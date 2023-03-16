import { RGBAFormat, RGBA_ASTC_4x4_Format, RGBA_BPTC_Format, RGBA_ETC2_EAC_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT5_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format } from "three";
import { BaseWorker } from "./base_worker";
import { TaskProcessor } from "./task_processor";

type InputParams = {
    type: 'transcode' | 'init';
    buffer?: ArrayBuffer;
    taskConfig?: Record<string, any>;
    transcoderBinary?: ArrayBuffer;
    config?: Record<string, any>;
}

type OutputParams = {
    dfdFlags: number;
    dfdTransferFn: number;
    format: number;
    hasAlpha: boolean;
    height: number;
    mipmaps: ArrayBuffer[];
    type: string;
    width: number;
}

export class KTX2Worker extends BaseWorker {

    protected _taskProcessor: TaskProcessor<InputParams, OutputParams>;

    private _jsContent: string;

    private _inited: boolean;

    private _config: Record<string, any>;

    private _transcoderBinary: ArrayBuffer;

    public constructor (jsContent: string, config: Record<string, any>, transcoderBinary: ArrayBuffer) {
        super();
        this._jsContent = jsContent;
        this._config = config;
        this._transcoderBinary = transcoderBinary;
    }

    private init () {
        if (this._inited) return;
        this._inited = true;
        this._taskProcessor = new TaskProcessor(this.getWorkerScript());
        //post init message
        this._taskProcessor.scheduleTask({ type: 'init', config: this._config, transcoderBinary: this._transcoderBinary }, [this._transcoderBinary]);
    }

    private getWorkerScript () {
        const fn = KTX2LoaderBasisWorker.toString();
        const body = [
            '/* constants */',
            'let _EngineFormat = ' + JSON.stringify(EngineFormat),
            'let _TranscoderFormat = ' + JSON.stringify(TranscoderFormat),
            'let _BasisFormat = ' + JSON.stringify(BasisFormat),
            '/* basis_transcoder.js */',
            this._jsContent,
            '/* worker */',
            fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
        ].join('\n');
        return body;
    }

    public transcode (buffer: ArrayBuffer, config: Record<string, any>) {
        this.init();
        return new Promise<OutputParams>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                type: 'transcode',
                buffer: buffer,
                taskConfig: config
            }, [buffer]).then(res => {
                resolve(res);
            }).catch(reject);
        });
    }

}

const BasisFormat = {
    ETC1S: 0,
    UASTC_4x4: 1,
};

const TranscoderFormat = {
    ETC1: 0,
    ETC2: 1,
    BC1: 2,
    BC3: 3,
    BC4: 4,
    BC5: 5,
    BC7_M6_OPAQUE_ONLY: 6,
    BC7_M5: 7,
    PVRTC1_4_RGB: 8,
    PVRTC1_4_RGBA: 9,
    ASTC_4x4: 10,
    ATC_RGB: 11,
    ATC_RGBA_INTERPOLATED_ALPHA: 12,
    RGBA32: 13,
    RGB565: 14,
    BGR565: 15,
    RGBA4444: 16,
};

const EngineFormat = {
    RGBAFormat: RGBAFormat,
    RGBA_ASTC_4x4_Format: RGBA_ASTC_4x4_Format,
    RGBA_BPTC_Format: RGBA_BPTC_Format,
    RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format,
    RGBA_PVRTC_4BPPV1_Format: RGBA_PVRTC_4BPPV1_Format,
    RGBA_S3TC_DXT5_Format: RGBA_S3TC_DXT5_Format,
    RGB_ETC1_Format: RGB_ETC1_Format,
    RGB_ETC2_Format: RGB_ETC2_Format,
    RGB_PVRTC_4BPPV1_Format: RGB_PVRTC_4BPPV1_Format,
    RGB_S3TC_DXT1_Format: RGB_S3TC_DXT1_Format,
};

/* WEB WORKER */

const KTX2LoaderBasisWorker = function () {

    let config;
    let transcoderPending;
    let BasisModule;

    //@ts-ignore
    const EngineFormat = _EngineFormat; // eslint-disable-line no-undef
    //@ts-ignore
    const TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
    //@ts-ignore
    const BasisFormat = _BasisFormat; // eslint-disable-line no-undef

    self.addEventListener('message', function (event) {
        const data = event.data;
        const params = event.data.params;
        handleMessage(data, params);
    });

    function handleMessage (data, params) {
        switch (params.type) {

            case 'init':
                config = params.config;
                init(params.transcoderBinary);
                break;

            case 'transcode':
                transcoderPending.then(() => {

                    try {

                        const { width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags } = transcode(params.buffer);

                        const buffers = [];

                        for (let i = 0; i < mipmaps.length; ++i) {

                            buffers.push(mipmaps[i].data.buffer);

                        }

                        // self.postMessage({ type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags }, buffers);
                        self.postMessage({
                            id: data.id,
                            error: null,
                            result: { type: 'transcode', width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags }
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

                    }

                });
                break;

        }
    }

    function init (wasmBinary) {

        transcoderPending = new Promise((resolve) => {

            BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
            //@ts-ignore
            BASIS(BasisModule); // eslint-disable-line no-undef

        }).then(() => {

            BasisModule.initializeBasis();

            if (BasisModule.KTX2File === undefined) {

                console.warn('THREE.KTX2Loader: Please update Basis Universal transcoder.');

            }

        });

    }

    function transcode (buffer) {

        const ktx2File = new BasisModule.KTX2File(new Uint8Array(buffer));

        function cleanup () {

            ktx2File.close();
            ktx2File.delete();

        }

        if (!ktx2File.isValid()) {

            cleanup();
            throw new Error('THREE.KTX2Loader:	Invalid or unsupported .ktx2 file');

        }

        const basisFormat = ktx2File.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S;
        const width = ktx2File.getWidth();
        const height = ktx2File.getHeight();
        const layers = ktx2File.getLayers() || 1;
        const levels = ktx2File.getLevels();
        const hasAlpha = ktx2File.getHasAlpha();
        const dfdTransferFn = ktx2File.getDFDTransferFunc();
        const dfdFlags = ktx2File.getDFDFlags();

        const { transcoderFormat, engineFormat } = getTranscoderFormat(basisFormat, width, height, hasAlpha);

        if (!width || !height || !levels) {

            cleanup();
            throw new Error('THREE.KTX2Loader:	Invalid texture');

        }

        if (!ktx2File.startTranscoding()) {

            cleanup();
            throw new Error('THREE.KTX2Loader: .startTranscoding failed');

        }

        const mipmaps = [];

        for (let mip = 0; mip < levels; mip++) {

            const layerMips = [];

            let mipWidth, mipHeight;

            for (let layer = 0; layer < layers; layer++) {

                const levelInfo = ktx2File.getImageLevelInfo(mip, layer, 0);
                mipWidth = levelInfo.origWidth < 4 ? levelInfo.origWidth : levelInfo.width;
                mipHeight = levelInfo.origHeight < 4 ? levelInfo.origHeight : levelInfo.height;
                const dst = new Uint8Array(ktx2File.getImageTranscodedSizeInBytes(mip, layer, 0, transcoderFormat));
                const status = ktx2File.transcodeImage(
                    dst,
                    mip,
                    layer,
                    0,
                    transcoderFormat,
                    0,
                    - 1,
                    - 1,
                );

                if (!status) {

                    cleanup();
                    throw new Error('THREE.KTX2Loader: .transcodeImage failed.');

                }

                layerMips.push(dst);

            }

            mipmaps.push({ data: concat(layerMips), width: mipWidth, height: mipHeight });

        }

        cleanup();

        return { width, height, hasAlpha, mipmaps, format: engineFormat, dfdTransferFn, dfdFlags };

    }

    //

    // Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
    // device capabilities, and texture dimensions. The list below ranks the formats separately
    // for ETC1S and UASTC.
    //
    // In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
    // significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
    // chooses RGBA32 only as a last resort and does not expose that option to the caller.
    const FORMAT_OPTIONS = [
        {
            if: 'astcSupported',
            basisFormat: [BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
            engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
            priorityETC1S: Infinity,
            priorityUASTC: 1,
            needsPowerOfTwo: false,
        },
        {
            if: 'bptcSupported',
            basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
            engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
            priorityETC1S: 3,
            priorityUASTC: 2,
            needsPowerOfTwo: false,
        },
        {
            if: 'dxtSupported',
            basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
            engineFormat: [EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
            priorityETC1S: 4,
            priorityUASTC: 5,
            needsPowerOfTwo: false,
        },
        {
            if: 'etc2Supported',
            basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
            engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
            priorityETC1S: 1,
            priorityUASTC: 3,
            needsPowerOfTwo: false,
        },
        {
            if: 'etc1Supported',
            basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.ETC1],
            engineFormat: [EngineFormat.RGB_ETC1_Format],
            priorityETC1S: 2,
            priorityUASTC: 4,
            needsPowerOfTwo: false,
        },
        {
            if: 'pvrtcSupported',
            basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
            transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
            engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
            priorityETC1S: 5,
            priorityUASTC: 6,
            needsPowerOfTwo: true,
        },
    ];

    const ETC1S_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {

        return a.priorityETC1S - b.priorityETC1S;

    });
    const UASTC_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {

        return a.priorityUASTC - b.priorityUASTC;

    });

    function getTranscoderFormat (basisFormat, width, height, hasAlpha) {

        let transcoderFormat;
        let engineFormat;

        const options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

        for (let i = 0; i < options.length; i++) {

            const opt = options[i];

            if (!config[opt.if]) continue;
            if (!opt.basisFormat.includes(basisFormat)) continue;
            if (hasAlpha && opt.transcoderFormat.length < 2) continue;
            if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height))) continue;

            transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0];
            engineFormat = opt.engineFormat[hasAlpha ? 1 : 0];

            return { transcoderFormat, engineFormat };

        }

        console.warn('THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.');

        transcoderFormat = TranscoderFormat.RGBA32;
        engineFormat = EngineFormat.RGBAFormat;

        return { transcoderFormat, engineFormat };

    }

    function isPowerOfTwo (value) {

        if (value <= 2) return true;

        return (value & (value - 1)) === 0 && value !== 0;

    }

    /** Concatenates N byte arrays. */
    function concat (arrays) {

        let totalByteLength = 0;

        for (const array of arrays) {

            totalByteLength += array.byteLength;

        }

        const result = new Uint8Array(totalByteLength);

        let byteOffset = 0;

        for (const array of arrays) {

            result.set(array, byteOffset);

            byteOffset += array.byteLength;

        }

        return result;

    }

};