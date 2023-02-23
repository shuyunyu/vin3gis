import { LineGeometry } from "./line_geometry";
import { LineMaterial } from "./line_material";
import { LineSegments2 } from "./line_segment2";
import { LineSegmentsGeometry } from "./line_segment_geometry";

export class Line2 extends LineSegments2 {

    public isLine2: boolean;

    constructor (geometry: LineSegmentsGeometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {

        super(geometry, material);

        this.isLine2 = true;

        this.type = 'Line2';

    }

}