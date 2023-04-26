import { WorkerPool } from "../../../../core/worker/pool/worker_pool";
import { InternalConfig } from "../../internal/internal_config";
import { ReprojectWorker } from "../reproject_worker";

export class ReprojectWorkerPool extends WorkerPool<ReprojectWorker> {

    public constructor (poolSize: number) {
        super(ReprojectWorker, poolSize);
    }

}

export const reprojectWorkerPool = new ReprojectWorkerPool(InternalConfig.REPROJECT_WORKER_COUNT);