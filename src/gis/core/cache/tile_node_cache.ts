class TileNodeCache {

    private static _instance?: TileNodeCache;

    public static get instance () {
        if (this._instance) return this._instance;
        this._instance = new TileNodeCache();
        return this._instance;
    }

    private constructor () { }

}

export const tileNodeCache = TileNodeCache.instance;