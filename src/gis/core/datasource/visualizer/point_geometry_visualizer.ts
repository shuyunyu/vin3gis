import { Object3D, Event } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { BaseGeometryVisualizer } from "./base_geometry_visualizer";

export class PointGeometryVisualizer extends BaseGeometryVisualizer {

    public show (entity: Entity, tilingScheme: ITilingScheme, root: Object3D<Event>): void {

    }

    public hide (entity: Entity, root: Object3D<Event>): void {

    }

    public remove (entity: Entity, root: Object3D<Event>): void {

    }

}