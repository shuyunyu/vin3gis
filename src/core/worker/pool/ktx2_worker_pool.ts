import { KTX2Worker } from "../ktx2_worker";
import { WorkerPool } from "./worker_pool";

export class KTX2WorkerPool extends WorkerPool<KTX2Worker>{

    private _jsContent: string;

    private _config: Record<string, any>;

    private _transcoderBinary: ArrayBuffer;

    public constructor (jsContent: string, config: Record<string, any>, poolSize: number, transcoderBinary: ArrayBuffer) {
        super(KTX2Worker, poolSize);
        this._jsContent = jsContent;
        this._config = config;
        this._transcoderBinary = transcoderBinary;
    }

    public getInstance (): KTX2Worker {
        //@ts-ignore
        return super.getInstance(this._jsContent, this._config, this._transcoderBinary);
    }

    public dispose (): void {
        super.dispose();
        this._transcoderBinary = null;
        this._jsContent = null;
        this._config = null;
    }

}