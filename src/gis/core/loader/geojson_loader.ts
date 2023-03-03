import { AssetDefines } from "../../../@types/core/asset/asset";
import { AssetLoader } from "../../../core/asset/asset_loader";
import { GeoJSONDefines } from "../../@types/core/geojson";
import { Cartographic } from "../cartographic";
import { MultiPointGeometry } from "../datasource/geometry/multi_point_geometry";
import { MultiPolygonGeometry } from "../datasource/geometry/multi_polygon_geometry";
import { MultiPolylineGeometry } from "../datasource/geometry/multi_polyline_geometry";
import { PointGeometry } from "../datasource/geometry/point_geometry";
import { PolygonGeometry } from "../datasource/geometry/polygon_geometry";
import { PolylineGeometry } from "../datasource/geometry/polyline_geometry";

//单个坐标处理函数
export type GeoJOSNCoordinateConvertor = (coordinate: GeoJSONDefines.Position) => Cartographic;

//指定 当单个geometry转换时 positions坐标数据转换为的几何类型
//e.g. 一维数组 转换为 LineString  二维数组 转换为Polygon
export type GeoJSONGeomtryConvertType = {
    one: 'LineString' | 'MultiPoint';
    two: | 'Polygon' | 'MultiLineString';
}

type GeoJSONLoadParams = AssetDefines.LoadAssetParams & {
    coordinateConvertor?: GeoJOSNCoordinateConvertor;
    geomtryConvertType?: GeoJSONGeomtryConvertType;
}

export class GeoJSONLoader {

    /**
     * 加载原始数据
     * @param params 
     * @returns 
     */
    public static loadSourceData (params: AssetDefines.LoadAssetParams) {
        return AssetLoader.loadJSON<GeoJSONDefines.GeoJSON>(params);
    }

    public static load (params: GeoJSONLoadParams) {
        return new Promise<any>((resolve, reject) => {
            this.loadSourceData(params).then((geojson: GeoJSONDefines.GeoJSON) => {
                this.convertToGeometries(geojson, params.coordinateConvertor)
            }).catch(reject);
        });
    }

    public static convertToGeometries (geojson: GeoJSONDefines.GeoJSON, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType) {
        if (geojson.type === "Feature") {
            this.convertFeature(geojson as GeoJSONDefines.Feature, coordinateConvertor);
        } else if (geojson.type === "FeatureCollection") {
            this.convertFeatrueCollection(geojson as GeoJSONDefines.FeatureCollection, coordinateConvertor);
        } else if (geojson.type === "GeometryCollection") {
            this.convertGeometryCollection(geojson as GeoJSONDefines.GeometryCollection, coordinateConvertor);
        } else {
            this.convertGeometry(geojson as GeoJSONDefines.Geometry, coordinateConvertor, geomtryConvertType);
        }
    }

    private static convertFeature (feature: GeoJSONDefines.Feature, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType) {
        const g = feature.geometry;
        if (g.type === "GeometryCollection") {
            return this.convertGeometryCollection(g as GeoJSONDefines.GeometryCollection, coordinateConvertor);
        } else {
            return this.convertGeometry(g as GeoJSONDefines.Geometry, coordinateConvertor, geomtryConvertType);
        }
    }

    private static convertFeatrueCollection (featureCollection: GeoJSONDefines.FeatureCollection, coordinateConvertor?: GeoJOSNCoordinateConvertor) {
        return featureCollection.features.forEach(feature => this.convertFeature(feature, coordinateConvertor));
    }

    private static convertGeometryCollection (geometryCollection: GeoJSONDefines.GeometryCollection, coordinateConvertor?: GeoJOSNCoordinateConvertor) {
        return geometryCollection.geometries.map(geometry => this.convertGeometryObject(geometry, coordinateConvertor));
    }

    private static convertGeometry (geometry: GeoJSONDefines.Geometry, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType) {
        coordinateConvertor = coordinateConvertor || this.coordinateConvertor;
        geomtryConvertType = geomtryConvertType || { one: 'LineString', two: 'Polygon' };
        const coordinates = geometry.coordinates;
        const coordinatesDimension = this.getCoordinatesDimension(coordinates);
        const coords = this.convertCoordinates(coordinates);
        if (coordinatesDimension === 0) {
            //point
            return new PointGeometry({ position: coords as Cartographic });
        } else if (coordinatesDimension === 1) {
            if (geomtryConvertType.one === "LineString") {
                return new PolylineGeometry({
                    positions: coords as Cartographic[]
                });
            } else {
                return new MultiPointGeometry({
                    positions: coords as Cartographic[]
                });
            }
        } else if (coordinatesDimension === 2) {
            if (geomtryConvertType.two === "Polygon") {

            } else {
                return new MultiPolygonGeometry({
                    positions: coords as Cartographic[][]
                });
            }
        } else {

        }
    }

    private static convertGeometryObject (geometry: GeoJSONDefines.GeometryObject, coordinateConvertor?: GeoJOSNCoordinateConvertor) {

    }

    /**
     * 默认坐标转换器
     * @param coordinate 
     * @returns 
     */
    private static coordinateConvertor (coordinate: GeoJSONDefines.Position) {
        return Cartographic.fromDegrees(coordinate[0], coordinate[1], coordinate[2]);
    }

    /**
     * 获取坐标数组的维数
     * @param coordinates 
     */
    private static getCoordinatesDimension (coordinates: GeoJSONDefines.Position | GeoJSONDefines.Position[] | GeoJSONDefines.Position[][] | GeoJSONDefines.Position[][][]) {
        if (!Array.isArray(coordinates)) return 0;
        const oneFirstEle = coordinates[0];
        if (!Array.isArray(oneFirstEle)) return 1;
        const twoFristEle = coordinates[0][0];
        if (!Array.isArray(twoFristEle)) return 2;
        return 3;
    }

    /**
     * 转换坐标
     * @param coordinates 
     */
    private static convertCoordinates (coordinates: GeoJSONDefines.Position | GeoJSONDefines.Position[] | GeoJSONDefines.Position[][] | GeoJSONDefines.Position[][][], coordinateConvertor?: GeoJOSNCoordinateConvertor) {
        coordinateConvertor = coordinateConvertor || this.coordinateConvertor;
        const dimension = this.getCoordinatesDimension(coordinates);
        if (dimension === 0) {
            return coordinateConvertor(coordinates as GeoJSONDefines.Position);
        } else if (dimension === 1) {
            const array = coordinates as GeoJSONDefines.Position[];
            return array.map(item => coordinateConvertor(item));
        } else if (dimension === 2) {
            const array = coordinates as GeoJSONDefines.Position[][];
            return array.map(item1 => item1.map(item => coordinateConvertor(item)));
        } else {
            const array = coordinates as GeoJSONDefines.Position[][][];
            return array.map(item2 => item2.map(item1 => item1.map(item => coordinateConvertor(item))));
        }
    }

}
