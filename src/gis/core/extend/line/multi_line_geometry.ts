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

        let pts = [];

        positionArray.forEach(array => {
            const length = array.length - 3;
            const points = new Array(2 * length);
            for (let i = 0; i < length; i += 3) {

                points[2 * i] = array[i];
                points[2 * i + 1] = array[i + 1];
                points[2 * i + 2] = array[i + 2];

                points[2 * i + 3] = array[i + 3];
                points[2 * i + 4] = array[i + 4];
                points[2 * i + 5] = array[i + 5];

            }
            pts = pts.concat(points);
        })

        super.setPositions(new Float32Array(pts));

        return this;


    }

    //@ts-ignore
    public setColors (colorArray: number[][]) {

        // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

        let cs = [];

        colorArray.forEach(array => {
            const length = array.length - 3;
            const colors = new Array(2 * length);
            for (let i = 0; i < length; i += 3) {

                colors[2 * i] = array[i];
                colors[2 * i + 1] = array[i + 1];
                colors[2 * i + 2] = array[i + 2];

                colors[2 * i + 3] = array[i + 3];
                colors[2 * i + 4] = array[i + 4];
                colors[2 * i + 5] = array[i + 5];

            }

            cs = cs.concat(colors);

        })

        super.setColors(new Float32Array(cs));

        return this;

    }

    //@ts-ignore
    public setLinewidths (linewidthArray: number[][]) {

        // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

        let lws = [];

        linewidthArray.forEach(array => {
            const length = array.length - 1;
            const linewidths = new Array(2 * length);

            for (let i = 0; i < length; i++) {

                linewidths[2 * i] = array[i];
                linewidths[2 * i + 1] = array[i + 1];

            }

            lws = lws.concat(linewidths);

        })

        super.setLinewidths(new Float32Array(lws));

        return this;

    }

    //@ts-ignore
    public setDashArguments (dashArgsArr: number[][]) {

        let ds = [];

        dashArgsArr.forEach(array => {
            // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

            const length = array.length - 4;
            const dashArgs = new Array(2 * length);

            for (let i = 0; i < length; i += 4) {

                dashArgs[2 * i] = array[i];
                dashArgs[2 * i + 1] = array[i + 1];
                dashArgs[2 * i + 2] = array[i + 2];
                dashArgs[2 * i + 3] = array[i + 3];

                dashArgs[2 * i + 4] = array[i + 4];
                dashArgs[2 * i + 5] = array[i + 5];
                dashArgs[2 * i + 6] = array[i + 6];
                dashArgs[2 * i + 7] = array[i + 7];

            }

            ds = ds.concat(dashArgs);

        })

        super.setDashArguments(ds);

        return this;
    }

}