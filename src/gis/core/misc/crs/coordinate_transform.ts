
// 定义一些常量
const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

const transformlat = function (lng: number, lat: number) {
    var lat = +lat;
    var lng = +lng;
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
};


const transformlng = function (lng: number, lat: number) {
    var lat = +lat;
    var lng = +lng;
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
const out_of_china = function (lng: number, lat: number) {
    var lat = +lat;
    var lng = +lng;
    // 纬度 3.86~53.55, 经度 73.66~135.05 
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};

/**
 * 提供百度坐标(BD09)，火星坐标(GCJ02),WGS84坐标之间的转换方法
 */
export class CoordinateTransform {


    /**
   * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02) 的转换
   * 即 百度 转 谷歌、高德
   * @param bd_lng
   * @param bd_lat
   * @returns {Array} [lng,lat]
   */
    public static bd09togcj02 (bd_lng: number, bd_lat: number): number[] {
        var bd_lng = +bd_lng;
        var bd_lat = +bd_lat;
        var x = bd_lng - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat];
    }

    /**
  * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
  * 即 谷歌、高德 转 百度
  * @param lng
  * @param lat
  * @returns {Array} [lng,lat]
  */
    public static gcj02tobd09 (lng: number, lat: number): number[] {
        var lat = +lat;
        var lng = +lng;
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat];
    }

    /**
   * WGS-84 转 GCJ-02
   * @param lng
   * @param lat
   * @returns {Array} [lng,lat]
   */
    public static wgs84togcj02 (lng: number, lat: number): number[] {
        var lat = +lat;
        var lng = +lng;
        if (out_of_china(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [mglng, mglat];
        }
    }

    /**
   * GCJ-02 转换为 WGS-84
   * @param lng
   * @param lat
   * @returns {Array} [lng,lat]
   */
    public static gcj02towgs84 (lng: number, lat: number): number[] {
        var lat = +lat;
        var lng = +lng;
        if (out_of_china(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [lng * 2 - mglng, lat * 2 - mglat];
        }
    }

    /**
       * BD09 转换为 WGS-84
       */

    public static bd09towgs84 (lng: number, lat: number): number[] {
        let gcj02 = this.bd09togcj02(lng, lat);
        return this.gcj02towgs84(gcj02[0], gcj02[1]);
    }

    /**
       * WGS-84 转换为 BD09
       */
    public static wgs84tobd09 (lng: number, lat: number): number[] {
        let gcj02 = this.wgs84togcj02(lng, lat);
        return this.gcj02tobd09(gcj02[0], gcj02[1]);
    }


}

