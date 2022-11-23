export class System {

    private _priority: number = 0;

    public set priority (val: number) {
        this._priority = val;
    }

    public get priority () {
        return this._priority;
    }

    public init () { }

    public update (dt: number) { }

    public postUpdate (dt: number) { }

    public destroy () { }

}