window.onload = () => {

    const initCameraPosition = new THREE.Vector3(118.156, 24.118, 1650000);
    // const initCameraPosition = new THREE.Vector3(0, 0, 1650000);
    const initCameraOrientation = new THREE.Vector3(0, -90, 0);
    const homeViewPort = new Vin3GIS.ViewPort(Vin3GIS.Cartographic.fromDegrees(initCameraPosition.x, initCameraPosition.y, initCameraPosition.z), Vin3GIS.Orientation.fromDegreeEulerAngles(initCameraOrientation));
    const mapViewer = new Vin3GIS.MapViewer({
        target: document.body,
        //EmptyImageryTileProvider
        //AMapImageryTileProvider
        //TdtImageryTileProvider
        imageryTileProivder: new Vin3GIS.AMapImageryTileProvider({
            style: 'street',
            // style: 'aerial',
            key: '1d109683f4d84198e37a38c442d68311'
        }),
        // imageryTileProivder: new Vin3GIS.ArcGISImageryTileProvider({
        //     url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
        //     // token: '1d109683f4d84198e37a38c442d68311'
        // }),
        // imageryTileProivder: new Vin3GIS.TencentImageryTileProvider({
        //     style: 'normal',
        // }),
        homeViewPort: homeViewPort,
        enablePan: true,
        enableZoom: true,
        enableRotate: true,
        enableDamping: true,
        // dampingFactor: 0.1
        // maxDistance: 16000000
    });
    // mapViewer.scene.imageryProviders.add(new Vin3GIS.AMapImageryTileProvider({
    //     style: 'note'
    // }));
}