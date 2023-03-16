import { XHRWorker } from "../xhr_worker";
import { WorkerPool } from "./worker_pool";

class XHRWorkerPool extends WorkerPool<XHRWorker> {

    public constructor () {
        super(XHRWorker, 1);
    }

}

export const xhrWorkerPool = new XHRWorkerPool();