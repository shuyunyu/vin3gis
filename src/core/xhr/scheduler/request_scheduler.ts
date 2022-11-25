export class RequestScheduler {

    private static _instance?: RequestScheduler;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new RequestScheduler();
        return this._instance;
    }

}