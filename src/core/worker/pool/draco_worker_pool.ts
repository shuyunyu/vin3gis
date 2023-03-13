import { DracoWorker } from "../draco_worker";
import { WorkerPool } from "./worker_pool";

export class DracokWorkerPool extends WorkerPool<DracoWorker>{

    public constructor () {
        super(DracoWorker, 1);
    }

}

export const dracoWorkerPool = new DracokWorkerPool();