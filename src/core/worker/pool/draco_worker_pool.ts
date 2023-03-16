import { DracoWorker } from "../draco_worker";
import { WorkerPool } from "./worker_pool";

export class DracokWorkerPool extends WorkerPool<DracoWorker>{

    private _jsContent: string;

    private _decoderConfig: Record<string, any>;

    public constructor (jsContent: string, decoderConfig: Record<string, any>, poolSize: number) {
        super(DracoWorker, poolSize);
        this._jsContent = jsContent;
        this._decoderConfig = decoderConfig;
    }

    public getInstance (): DracoWorker {
        //@ts-ignore
        return super.getInstance(this._jsContent, this._decoderConfig);
    }

    public dispose (): void {
        super.dispose();
        this._jsContent = null;
        this._decoderConfig = null;
    }

}
