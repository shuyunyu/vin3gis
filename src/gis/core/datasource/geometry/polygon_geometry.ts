import { Color, Material } from "three";
import { math } from "../../../../core/math/math";
import { Utils } from "../../../../core/utils/utils";
import { GeometryUpdateProperty } from "../../../decorator/decorator";
import { ExtrudedGeometryUVGenerator } from "../../extend/shape/changable_extruded_geometry";
import { PolygonShape } from "../misc/polygon_shape";
import { PolygonGeometryVisualizer } from "../visualizer/polygon_geometry_visualizer";
import { BaseGeometry } from "./base_geometry";
import { GeometryType } from "./geometry";

export type PolygonGeometryOptions = {
    shapes?: PolygonShape | PolygonShape[];
    color?: Color;
    emissive?: Color;//自发光颜色 仅在effectedByLight为true时起效果
    opacity?: number;
    height?: number;//polygon位于空间中的高度
    extrudedHeight?: number;//挤压高度
    material?: Material;//材质
    effectedByLight?: boolean;//是否受光的影响
    uvGenerator?: ExtrudedGeometryUVGenerator;//uv 坐标生成器
}

export class PolygonGeometry extends BaseGeometry {

    private _shapes: PolygonShape[];

    public get shapes (): PolygonShape[] {
        return this._shapes;
    }

    @GeometryUpdateProperty()
    public set shapes (val: PolygonShape | PolygonShape[]) {
        this._shapes = this.getShapes(val);
    }

    private _color: Color;

    public get color () {
        return this._color;
    }

    @GeometryUpdateProperty()
    public set color (val: Color) {
        this._color = val;
    }

    private _emissive: Color;

    public get emissive () {
        return this._emissive;
    }

    @GeometryUpdateProperty()
    public set emissive (val: Color) {
        this._emissive = val;
    }

    private _opacity: number;

    public get opacity () {
        return this._opacity;
    }

    @GeometryUpdateProperty()
    public set opacity (val: number) {
        this._opacity = math.clamp(val, 0, 1);
    }

    private _height: number;

    public get height () {
        return this._height;
    }

    @GeometryUpdateProperty()
    public set height (val: number) {
        this._height = val;
    }

    private _extrudedHeight: number;

    public get extrudedHeight () {
        return this._extrudedHeight;
    }

    @GeometryUpdateProperty()
    public set extrudedHeight (val: number) {
        this._extrudedHeight = Math.max(val, 0);
    }

    private _material: Material;

    public get material () {
        return this._material;
    }

    @GeometryUpdateProperty()
    public set material (val: Material) {
        this._material = val;
    }

    private _effectedByLight: boolean;

    public get effectedByLight () {
        return this._effectedByLight;
    }

    @GeometryUpdateProperty()
    public set effectedByLight (val: boolean) {
        this._effectedByLight = val;
    }

    private _uvGenerator: ExtrudedGeometryUVGenerator;

    public get uvGenerator () {
        return this._uvGenerator;
    }

    @GeometryUpdateProperty()
    public set uvGenerator (val: ExtrudedGeometryUVGenerator) {
        this._uvGenerator = val;
    }

    public constructor (options?: PolygonGeometryOptions) {
        options = options || {};
        super({ type: GeometryType.POLYGON });
        this._shapes = this.getShapes(options.shapes);
        this._color = Utils.defaultValue(options.color, new Color());
        this._emissive = Utils.defaultValue(options.emissive, new Color(0x000000));
        this._opacity = math.clamp(Utils.defaultValue(options.opacity, 1), 0, 1);
        this._height = Utils.defaultValue(options.height, 0);
        this._extrudedHeight = Math.max(Utils.defaultValue(options.extrudedHeight, 0), 0);
        this._material = options.material;
        this._effectedByLight = Utils.defaultValue(options.effectedByLight, false);
        this._uvGenerator = options.uvGenerator;
        this.visualizer = new PolygonGeometryVisualizer();
    }

    private getShapes (shape?: PolygonShape | PolygonShape[]) {
        if (!shape) return [];
        if (Array.isArray(shape)) return shape;
        return [shape];
    }

    public clone () {
        return new PolygonGeometry({
            shapes: this.shapes.map(shape => shape.clone()),
            color: this.color.clone(),
            emissive: this.emissive.clone(),
            opacity: this.opacity,
            height: this.height,
            extrudedHeight: this.extrudedHeight,
            material: this.material,
            effectedByLight: this.effectedByLight,
            uvGenerator: this.uvGenerator
        });
    }

}