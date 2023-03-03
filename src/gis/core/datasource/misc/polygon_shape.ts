import { Cartographic } from "../../cartographic";

export class PolygonShape {

    public positions: Cartographic[];

    public holes: Cartographic[][];

    public constructor (positions?: Cartographic[], holes?: Cartographic[][]) {
        this.positions = positions || [];
        this.holes = holes || [];
    }

    public clone () {
        return new PolygonShape(
            this.positions.map(pos => pos.clone()),
            this.holes.map(hole => hole.map(pos => pos.clone()))
        );
    }

}