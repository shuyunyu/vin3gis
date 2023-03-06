import { Earth3DTileset } from "./earth_3dtileset";

export class Earth3DTilesetMetadata {

    private _tileset: Earth3DTileset;

    public get tileset () {
        return this._tileset;
    }

    constructor (tileset: Earth3DTileset) {
        this._tileset = tileset;
    }

}