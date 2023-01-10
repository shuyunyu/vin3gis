import { Object3D } from "three";
import { ITilingScheme } from "../../tilingscheme/tiling_scheme";
import { Entity } from "../entity";
import { IGeometryVisualizer } from "./geometry_visualizer";

export class BaseGeometryVisualizer implements IGeometryVisualizer {

    public show (entity: Entity, tilingScheme: ITilingScheme, root: Object3D) {

    }

    public hide (entity: Entity, root: Object3D) {

    }

    public remove (entity: Entity, root: Object3D) {

    }

}