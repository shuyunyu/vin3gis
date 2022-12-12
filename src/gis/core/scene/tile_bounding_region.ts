import { Plane, Ray, Vector3 } from "three";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Rectangle } from "../geometry/rectangle";
import { Transform } from "../transform/transform";
import { FrameState } from "./frame_state";
import { QuadtreeTile } from "./quad_tree_tile";

const scratchCartesian = new Cartesian3();
const westNormal2D = new Cartesian3(0, -1, 0);
const eastNormal2D = new Cartesian3(0, 1, 0);
const northNormal2D = new Cartesian3(1, 0, 0);
const southNormal2D = new Cartesian3(-1, 0, 0);
const vectorFromSouthwestCorner = new Cartesian3();
const vectorFromNortheastCorner = new Cartesian3();

export class TileBoundingRegion {

    private _tile: QuadtreeTile;

    private _rectangle: Rectangle;

    private southwestCornerVec = new Vector3();

    private northeastCornerVec = new Vector3();

    // private westNormal = new Vector3();

    // private southNormal = new Vector3();

    // private eastNormal = new Vector3();

    // private northNormal = new Vector3();

    public get rectangle () {
        return this._rectangle;
    }

    constructor (tile: QuadtreeTile) {
        this._tile = tile;
        this._rectangle = tile.nativeRectangle!.clone();
        // this.computeBox();
    }

    // private computeBox () {
    //     this.southwestCornerVec = Transform.earthCar3ToWorldCar3(new Cartesian3(this.rectangle.west, this.rectangle.south, 0)).toVec3();
    //     this.northeastCornerVec = Transform.earthCar3ToWorldCar3(new Cartesian3(this.rectangle.east, this.rectangle.north, 0)).toVec3();

    //     let westernMidpointVec = Transform.earthCar3ToWorldCar3(new Cartesian3(this.rectangle.west, (this.rectangle.south + this.rectangle.north) / 2, 0));

    //     let westNormal = new Cartesian3();
    //     Cartesian3.cross(westNormal, westernMidpointVec, Cartesian3.UNIT_Y);
    //     westNormal.normalize();

    //     let easternMidpointVec = Transform.earthCar3ToWorldCar3(new Cartesian3(this.rectangle.east, (this.rectangle.south + this.rectangle.north) / 2, 0));
    //     let eastNormal = new Cartesian3();
    //     Cartesian3.cross(eastNormal, Cartesian3.UNIT_Y, easternMidpointVec);
    //     eastNormal.normalize();

    //     let westVector = new Cartesian3();
    //     westVector = Cartesian3.subtract(westVector, westernMidpointVec, easternMidpointVec);

    //     let eastWestNormal = new Cartesian3();
    //     Cartesian3.normalize(eastWestNormal, westVector);

    //     let south = this.rectangle.south;
    //     //地球表面的法线   暂时先不处理地球曲率问题
    //     let southSurfaceNormal = new Cartesian3(0, 1, 0);
    //     if (south > 0) {
    //         let southCenterVec = Transform.earthCar3ToWorldCar3(new Cartesian3((this.rectangle.west + this.rectangle.east) / 2, this.rectangle.south, 0));
    //         let westPlane = new Plane();
    //         westPlane.setFromNormalAndCoplanarPoint(westNormal.toVec3(), this.southwestCornerVec);
    //         let rayScratch = new Ray(southCenterVec.toVec3(), eastWestNormal.toVec3());
    //         let distance = rayScratch.distanceToPlane(westPlane);
    //         //Find a point that is on the west and the south planes
    //         this.southwestCornerVec = rayScratch.origin.clone().add(rayScratch.direction.multiplyScalar(distance));
    //     }

    //     let southNormal = new Cartesian3();
    //     Cartesian3.cross(southNormal, southSurfaceNormal, westVector);
    //     southNormal.normalize();

    //     let north = this.rectangle.north;
    //     //地球表面的法线   暂时先不处理地球曲率问题
    //     let northSurfaceNormal = new Cartesian3(0, 1, 0);
    //     if (north < 0) {
    //         let northCenterVec = Transform.earthCar3ToWorldCar3(new Cartesian3((this.rectangle.west + this.rectangle.east) / 2, this.rectangle.north, 0));
    //         let rayScratch = new Ray(northCenterVec.toVec3(), Cartesian3.negate(new Cartesian3(), northCenterVec).toVec3());
    //         let esatPlane = new Plane();
    //         esatPlane.setFromNormalAndCoplanarPoint(eastNormal.toVec3(), this.northeastCornerVec);
    //         let distance = rayScratch.distanceToPlane(esatPlane);
    //         this.northeastCornerVec = rayScratch.origin.clone().add(rayScratch.direction.multiplyScalar(distance));
    //     }

    //     let northNormal = new Cartesian3();
    //     Cartesian3.cross(northNormal, westVector, northSurfaceNormal);
    //     northNormal.normalize();

    //     this.westNormal = westNormal.toVec3();
    //     this.eastNormal = eastNormal.toVec3();
    //     this.northNormal = northNormal.toVec3();
    //     this.southNormal = southNormal.toVec3();
    // }

    /**
     * 计算瓦片到摄像机的距离
     */
    public distanceToCamera (frameState: FrameState) {
        let cameraPosition = Transform.worldCar3ToGeoCar3(frameState.cameraWorldRTS.position, scratchCartesian);
        let result = 0;
        let rectangle = this._tile.rectangle;

        if (!rectangle.containsCartesian2({ x: cameraPosition.x, y: cameraPosition.z })) {
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