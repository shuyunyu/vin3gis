import { LineSegmentsGeometry } from "./line_segment_geometry";

export class MultiLineGeometry extends LineSegmentsGeometry {

    public readonly isLineGeometry: boolean;

    public constructor () {
        super();
        this.isLineGeometry = true;
        this.type = "MultiLineGeometry";
    }

    //@ts-ignore
    public setPositions (positionArray: number[][]) {

        // converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format

        let totalLength = 0;
        positionArray.forEach(array => totalLength += array.length - 3);

        const points = new Float32Array(2 * totalLength);

        positionArray.forEach(array => {
            const length = array.length - 3;
            for (let i = 0; i < length; i += 3) {

                points[2 * i] = array[i];
                points[2 * i + 1] = array[i + 1];
                points[2 * i + 2] = array[i + 2];

                points[2 * i + 3] = array[i + 3];
                points[2 * i + 4] = array[i + 4];
                points[2 * i + 5] = array[i + 5];

            }
        })

        super.setPositions(points);

        return this;


    }

    public setColors (colorArray: number[][]) {

        // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

        let totalLength = 0;
        colorArray.forEach(array => totalLength += array.length - 3);

        const colors = new Float32Array(2 * totalLength);

        colorArray.forEach(array => {
            const length = array.length - 3;
            for (let i = 0; i < length; i += 3) {

                colors[2 * i] = array[i];
                colors[2 * i + 1] = array[i + 1];
                colors[2 * i + 2] = array[i + 2];

                colors[2 * i + 3] = array[i + 3];
                colors[2 * i + 4] = array[i + 4];
                colors[2 * i + 5] = array[i + 5];

            }
        })

        super.setColors(colors);

        return this;

    }

}