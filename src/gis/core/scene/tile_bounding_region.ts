import { Cartesian3 } from "../cartesian/cartesian3";
import { FrameState } from "./frame_state";
import { QuadtreeTile } from "./quad_tree_tile";

const westNormal2D = new Cartesian3(0, -1, 0);
const eastNormal2D = new Cartesian3(0, 1, 0);
const southNormal2D = new Cartesian3(-1, 0, 0);
const northNormal2D = new Cartesian3(1, 0, 0);
const vectorFromSouthwestCorner = new Cartesian3();
const vectorFromNortheastCorner = new Cartesian3();

export class TileBoundingRegion {

    private _tile: QuadtreeTile;

    constructor (tile: QuadtreeTile) {
        this._tile = tile;
    }

    /**
     * 计算瓦片到摄像机的距离
     */
    public distanceToCamera (frameState: FrameState) {
        let cameraPosition = frameState.cameraPositionWC;
        let result = 0;
        let rectangle = this._tile.rectangle;

        if (!rectangle.containsCartesian2(cameraPosition)) {
            let southwestCornerCartesian3 = rectangle.southWest;
            let northeastCornerCartesian3 = rectangle.northEast;
            let westNormal = westNormal2D;
            let eastNormal = eastNormal2D;
            let northNormal = northNormal2D;
            let southNormal = southNormal2D;

            Cartesian3.subtract(vectorFromSouthwestCorner, cameraPosition, southwestCornerCartesian3);
            let distanceToWestPlane = Cartesian3.dot(vectorFromSouthwestCorner, westNormal);
            let distanceToSouthPlane = Cartesian3.dot(vectorFromSouthwestCorner, southNormal);


            Cartesian3.subtract(vectorFromNortheastCorner, cameraPosition, northeastCornerCartesian3);
            let distanceToEastPlane = Cartesian3.dot(vectorFromNortheastCorner, eastNormal);
            let distanceToNorthPlane = Cartesian3.dot(vectorFromNortheastCorner, northNormal);

            if (distanceToWestPlane > 0.0) {
                result += distanceToWestPlane * distanceToWestPlane;
            } else if (distanceToEastPlane > 0.0) {
                result += distanceToEastPlane * distanceToEastPlane;
            }

            if (distanceToSouthPlane > 0.0) {
                result += distanceToSouthPlane * distanceToSouthPlane;
            } else if (distanceToNorthPlane > 0.0) {
                result += distanceToNorthPlane * distanceToNorthPlane;
            }

        }

        result += cameraPosition.z * cameraPosition.z;

        return Math.sqrt(result);
    }
}