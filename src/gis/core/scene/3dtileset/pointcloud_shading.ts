import { Utils } from "../../../../core/utils/utils";

export interface PointCloudShadingOptions {
    attenuation?: boolean;//Perform point attenuation based on geometric error.
    geometricErrorScale?: number;//Scale to be applied to the geometric error before computing attenuation.
    maximumAttenuation?: number;//Maximum point attenuation in pixels. If undefined, the Cesium3DTileset's maximumScreenSpaceError will be used.
    baseResolution?: number;
    eyeDomeLighting?: boolean;
    eyeDomeLightingStrength?: number;
    eyeDomeLightingRadius?: number;
    backFaceCulling?: boolean;
    normalShading?: boolean;
}

export class PointCloudShading {

    private _attenuation: boolean;

    private _geometricErrorScale: number;

    private _maximumAttenuation?: number;

    private _baseResolution?: number;

    private _eyeDomeLighting: boolean;

    private _eyeDomeLightingStrength: number;

    private _eyeDomeLightingRadius: number;

    private _backFaceCulling: boolean;

    private _normalShading: boolean;

    public get attenuation () {
        return this._attenuation;
    }

    public get geometricErrorScale () {
        return this._geometricErrorScale;
    }

    public get maximumAttenuation () {
        return this._maximumAttenuation;
    }

    public get baseResolution () {
        return this._baseResolution;
    }

    public get eyeDomeLighting () {
        return this._eyeDomeLighting;
    }

    public get eyeDomeLightingStrength () {
        return this._eyeDomeLightingStrength;
    }

    public get eyeDomeLightingRadius () {
        return this._eyeDomeLightingRadius;
    }

    public get backFaceCulling () {
        return this._backFaceCulling;
    }

    public get normalShading () {
        return this._normalShading;
    }

    constructor (options?: PointCloudShadingOptions) {
        options = Utils.defined(options) ? options! : {};
        this._attenuation = Utils.defaultValue(options.attenuation, false);
        this._geometricErrorScale = Utils.defaultValue(options.geometricErrorScale, 1.0);
        this._maximumAttenuation = options.maximumAttenuation;
        this._baseResolution = options.baseResolution;
        this._eyeDomeLighting = Utils.defaultValue(options.eyeDomeLighting, true);
        this._eyeDomeLightingStrength = Utils.defaultValue(options.eyeDomeLightingStrength, 1.0);
        this._eyeDomeLightingRadius = Utils.defaultValue(options.eyeDomeLightingRadius, 1.0);
        this._backFaceCulling = Utils.defaultValue(options.backFaceCulling, false);
        this._normalShading = Utils.defaultValue(options.normalShading, true);

    }

}