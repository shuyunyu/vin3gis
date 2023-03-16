import { TaskProcessor } from "./task_processor";

export class BaseWorker {

    protected _taskProcessor: TaskProcessor<any, any>;

    public dispose () {
        if (this._taskProcessor) {
            this._taskProcessor.dispose();
            this._taskProcessor = null;
        }
    }

}