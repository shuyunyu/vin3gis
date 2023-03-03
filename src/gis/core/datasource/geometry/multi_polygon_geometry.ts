import { Color } from "three";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { Cartographic } from "../../cartographic";
import { ExtrudedGeometryUVGenerator } from "../../extend/shape/changable_extruded_geometry";
import { MultiPolygonGeometryViauzlizer } from "../visualizer/multi_polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";
import { PolygonGeometry } from "./polygon_geometry";

export type MultiPolygonGeometryOptions = {
    positions?: Cartographic[][];
    holes?: Cartographic[][][];
    colors?: Color[];
    emissives?: Color[];//固有色数组
    opacities?: number[];
    extrudedHeights?: number[];
    heights?: number[];
    effectedByLights?: boolean[];//是否受光照的影响
    uvGenerators?: ExtrudedGeometryUVGenerator[];
}

export class MultiPolygonGeometry extends BaseGeometry {

    private _positions: Cartographic[][];

    public get positions () {
        return this._positions;
    }

    @GeometryUpdateProperty()
    public set positions (val: Cartographic[][]) {
        this._positions = val;
    }

    private _holes: Cartographic[][][];

    public get holes () {
        return this._holes;
    }

    @GeometryUpdateProperty()
    public set holes (val: Cartographic[][][]) {
        this._holes = val;
    }

    private _colors: Color[];

    public get colors () {
        return this._colors;
    }

    @GeometryUpdateProperty()
    public set colors (val: Color[]) {
        this._colors = val;
    }

    private _emissives: Color[];

    public get emissives () {
        return this._emissives;
    }

    @GeometryUpdateProperty()
    public set emissives (val: Color[]) {
        this._emissives = val;
    }

    private _opacities: number[];

    public get opacities () {
        return this._opacities;
    }

    @GeometryUpdateProperty()
    public set opacities (val: number[]) {
        this._opacities = val;
    }

    private _extrudedHeights: number[];

    public get extrudedHeights () {
        return this._extrudedHeights;
    }

    @GeometryUpdateProperty()
    public set extrudedHeights (val: number[]) {
        this._extrudedHeights = val;
    }

    private _heights: number[];

    public get heights () {
        return this._heights;
    }

    @GeometryUpdateProperty()
    public set heights (val: number[]) {
        this._heights = val;
    }

    private _effectedByLights: boolean[];

    public get effectedByLights () {
        return this._effectedByLights;
    }

    @GeometryUpdateProperty()
    public set effectedByLights (val: boolean[]) {
        this._effectedByLights = val;
    }

    private _uvGenerators: ExtrudedGeometryUVGenerator[];

    public get uvGenerators () {
        return this._uvGenerators;
    }

    @GeometryUpdateProperty()
    public set uvGenerators (val: ExtrudedGeometryUVGenerator[]) {
        this._uvGenerators = val;
    }

    public constructor (options?: MultiPolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.MULTI_POLYGON });
        this._positions = Utils.defaultValue(options.positions, []);
        this._holes = Utils.defaultValue(options.holes, []);
        this._colors = Utils.defaultValue(options.colors, []);
        this._emissives = Utils.defaultValue(options.emissives, []);
        this._opacities = Utils.defaultValue(options.opacities, []);
        this._extrudedHeights = Utils.defaultValue(options.extrudedHeights, []);
        this._heights = Utils.defaultValue(options.heights, []);
        this._effectedByLights = Utils.defaultValue(options.effectedByLights, []);
        this._uvGenerators = Utils.defaultValue(options.uvGenerators, []);
        this.visualizer = new MultiPolygonGeometryViauzlizer();
    }

    public clone () {
        return new MultiPolygonGeometry({
            positions: this.positions.map(posArr => posArr.map(pos => pos.clone())),
            holes: this.holes.map(holes => holes.map(hole => hole.map(pos => pos.clone()))),
            colors: this.colors.map(color => color.clone()),
            emissives: this.emissives.map(emissive => emissive.clone()),
            opacities: this.opacities,
            extrudedHeights: this.extrudedHeights,
            heights: this.heights,
            effectedByLights: this.effectedByLights,
            uvGenerators: this._uvGenerators
        });
    }

    /**
     * 从PolygonGeometry构建此对象
     * @param polygons 
     */
    public static fromPolygons (polygons: PolygonGeometry[]) {
        const positions: Cartographic[][] = [];
        const holes: Cartographic[][][] = [];
        const colors: Color[] = [];
        const emissives: Color[] = [];
        const opacities: number[] = [];
        const extrudedHeights: number[] = [];
        const heights: number[] = [];
        const effectedByLights: boolean[] = [];
        const uvGenerators: ExtrudedGeometryUVGenerator[] = [];
        for (let i = 0; i < polygons.length; i++) {
            const polygon = polygons[i];
            // positions.push(polygon.positions);
            // holes.push(polygon.holes);
            colors.push(polygon.color);
            emissives.push(polygon.emissive);
            opacities.push(polygon.opacity);
            extrudedHeights.push(polygon.extrudedHeight);
            heights.push(polygon.height);
            effectedByLights.push(polygon.effectedByLight);
            uvGenerators.push(polygon.uvGenerator);
        }
        return new MultiPolygonGeometry({
            positions: positions,
            holes: holes,
            colors: colors,
            emissives: emissives,
            opacities: opacities,
            extrudedHeights: extrudedHeights,
            heights: heights,
            effectedByLights: effectedByLights,
            uvGenerators: uvGenerators
        });
    }

}