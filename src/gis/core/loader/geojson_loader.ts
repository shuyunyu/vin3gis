import { AssetDefines } from "../../../@types/core/asset/asset";
import { AssetLoader } from "../../../core/asset/asset_loader";
import { GeoJSONDefines } from "../../@types/core/geojson";
import { Cartographic } from "../cartographic";
import { BaseGeometry } from "../datasource/geometry/base_geometry";
import { MultiPointGeometry } from "../datasource/geometry/multi_point_geometry";
import { MultiPolygonGeometry } from "../datasource/geometry/multi_polygon_geometry";
import { MultiPolylineGeometry } from "../datasource/geometry/multi_polyline_geometry";
import { PointGeometry } from "../datasource/geometry/point_geometry";
import { PolygonGeometry } from "../datasource/geometry/polygon_geometry";
import { PolylineGeometry } from "../datasource/geometry/polyline_geometry";
import { PolygonShape } from "../datasource/misc/polygon_shape";

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

export type GeoJSONFeatureLoadResult = {
    feature?: GeoJSONDefines.Feature;
    geometries: BaseGeometry[];
}

/**
 * GeoJSON 数据加载器
 */
export class GeoJSONLoader {

    /**
     * 加载原始数据
     * @param params 
     * @returns 
     */
    public static loadSourceData (params: AssetDefines.LoadAssetParams) {
        return AssetLoader.loadJSON<GeoJSONDefines.GeoJSON>(params);
    }

    /**
     * 加载数据并转换成内置Geometry对象
     * @param params 
     * @returns 
     */
    public static load (params: GeoJSONLoadParams) {
        return new Promise<GeoJSONFeatureLoadResult[]>((resolve, reject) => {
            this.loadSourceData(params).then((geojson: GeoJSONDefines.GeoJSON) => {
                const res = this.convertToGeometries(geojson, params.coordinateConvertor);
                resolve(res);
            }).catch(reject);
        });
    }

    /**
     * 转换为内置Geometry对象
     * @param geojson 
     * @param coordinateConvertor 
     * @param geomtryConvertType 
     */
    public static convertToGeometries (geojson: GeoJSONDefines.GeoJSON, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType): GeoJSONFeatureLoadResult[] {
        if (geojson.type === "Feature") {
            return [this.convertFeature(geojson as GeoJSONDefines.Feature, coordinateConvertor)];
        } else if (geojson.type === "FeatureCollection") {
            return this.convertFeatrueCollection(geojson as GeoJSONDefines.FeatureCollection, coordinateConvertor);
        } else if (geojson.type === "GeometryCollection") {
            const res = this.convertGeometryCollection(geojson as GeoJSONDefines.GeometryCollection, coordinateConvertor);
            const geometries: BaseGeometry[] = [];
            res.forEach(item => {
                if (Array.isArray(item)) {
                    geometries.push(...item);
                } else {
                    geometries.push(item);
                }
            });
            return [{
                feature: null,
                geometries: geometries
            }]
        } else {
            const geometry = this.convertGeometry(geojson as GeoJSONDefines.Geometry, coordinateConvertor, geomtryConvertType);
            return [{
                feature: null,
                geometries: [geometry]
            }];
        }
    }

    /**
     * 转换单个Feature
     * @param feature 
     * @param coordinateConvertor 
     * @param geomtryConvertType 
     * @returns 
     */
    private static convertFeature (feature: GeoJSONDefines.Feature, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType): GeoJSONFeatureLoadResult {
        const g = feature.geometry;
        const res: BaseGeometry[] = [];
        if (g.type === "GeometryCollection") {
            const r = this.convertGeometryCollection(g as GeoJSONDefines.GeometryCollection, coordinateConvertor);
            r.forEach(item => {
                if (Array.isArray(item)) {
                    res.push(...item);
                } else {
                    res.push(item);
                }
            });
        } else {
            const r = this.convertGeometry(g as GeoJSONDefines.Geometry, coordinateConvertor, geomtryConvertType);
            res.push(r);
        }
        return {
            feature: feature,
            geometries: res
        }
    }

    private static convertFeatrueCollection (featureCollection: GeoJSONDefines.FeatureCollection, coordinateConvertor?: GeoJOSNCoordinateConvertor) {
        return featureCollection.features.map(feature => this.convertFeature(feature, coordinateConvertor));
    }

    private static convertGeometryCollection (geometryCollection: GeoJSONDefines.GeometryCollection, coordinateConvertor?: GeoJOSNCoordinateConvertor) {
        return geometryCollection.geometries.map(geometry => this.convertGeometryObject(geometry, coordinateConvertor));
    }

    /**
     * 转换 Geometry 
     * @param geometry 
     * @param coordinateConvertor 
     * @param geomtryConvertType 
     * @returns 
     */
    private static convertGeometry (geometry: GeoJSONDefines.Geometry, coordinateConvertor?: GeoJOSNCoordinateConvertor, geomtryConvertType?: GeoJSONGeomtryConvertType): BaseGeometry {
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
                const psArray = coords as Cartographic[][];
                const shapes = psArray.map(ps => new PolygonShape(ps));
                return new PolygonGeometry({ shapes: shapes });
            } else {
                return new MultiPolylineGeometry({
                    positions: coords as Cartographic[][]
                });
            }
        } else {
            const psArrayList = coords as Cartographic[][][];
            const shapes = psArrayList.map(psArray => psArray.map(ps => new PolygonShape(ps)));
            return new MultiPolygonGeometry({ shapes: shapes });
        }
    }

    /**
     * 转换单个geometryObject数据
     * @param geometry 
     * @param coordinateConvertor 
     * @returns 
     */
    private static convertGeometryObject (geometry: GeoJSONDefines.GeometryObject, coordinateConvertor?: GeoJOSNCoordinateConvertor): BaseGeometry | BaseGeometry[] {
        coordinateConvertor = coordinateConvertor || this.coordinateConvertor;
        if (geometry.type === "Point") {
            const geo = geometry as GeoJSONDefines.Point;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic;
            return new PointGeometry({ position: coords });
        } else if (geometry.type === "MultiPoint") {
            const geo = geometry as GeoJSONDefines.MultiPoint;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic[];
            return new MultiPointGeometry({ positions: coords });
        } else if (geometry.type === "LineString") {
            const geo = geometry as GeoJSONDefines.LineString;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic[];
            return new PolylineGeometry({ positions: coords });
        } else if (geometry.type === "MultiLineString") {
            const geo = geometry as GeoJSONDefines.MultiLineString;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic[][];
            return new MultiPolylineGeometry({ positions: coords });
        } else if (geometry.type === "Polygon") {
            const geo = geometry as GeoJSONDefines.Polygon;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic[][];
            const shapes = coords.map(coordArray => new PolygonShape(coordArray));
            return new PolygonGeometry({ shapes: shapes });
        } else if (geometry.type === "MultiPolygon") {
            const geo = geometry as GeoJSONDefines.MultiPolygon;
            const coords = this.convertCoordinates(geo.coordinates, coordinateConvertor) as Cartographic[][][];
            const shapesArray = coords.map(coordArray => coordArray.map(array => new PolygonShape(array)));
            return new MultiPolygonGeometry({ shapes: shapesArray });
        } else if (geometry.type === "GeometryCollection") {
            const geo = geometry as GeoJSONDefines.GeometryCollection;
            return geo.geometries.map(g => this.convertGeometryObject(g, coordinateConvertor)) as BaseGeometry[];
        }
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
