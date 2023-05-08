import { ICartesian2Like } from "../../@types/core/gis";
import { Earth3DTile } from "./3dtileset/earth_3dtile";
import { Earth3DTileFeature } from "./3dtileset/earth_3dtile_feature";
import { Earth3DTileset } from "./3dtileset/earth_3dtileset";
import { EarthScene } from "./earth_scene";

export class Picking {

    private _scene: EarthScene

    public constructor (scene: EarthScene) {
        this._scene = scene;
    }

    public pick (pos: ICartesian2Like): Earth3DTileFeature {
        const earth3dtilesets: Earth3DTileset[] = [];
        this._scene.primitives.foreach(primitive => {
            if (primitive instanceof Earth3DTileset) {
                earth3dtilesets.push(primitive);
            }
        });
        return null
    }

    private pickClosest3dtile (root: Earth3DTile) {

    }

}