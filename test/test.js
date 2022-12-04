window.onload = () => {

    const initCameraPosition = new THREE.Vector3(118.156, 24.118, 1650000);
    // const initCameraPosition = new THREE.Vector3(0, 0, 165000000);
    const initCameraOrientation = new THREE.Vector3(0, -78, 0);
    const homeViewPort = new Vin3GIS.ViewPort(Vin3GIS.Cartographic.fromDegrees(initCameraPosition.x, initCameraPosition.y, initCameraPosition.z), Vin3GIS.Orientation.fromDegreeEulerAngles(initCameraOrientation));
    const mapViewer = new Vin3GIS.MapViewer({
        target: document.body,
        imageryTileProivder: new Vin3GIS.AMapImageryTileProvider({
            style: 'street',
            key: '1d109683f4d84198e37a38c442d68311'
        }),
        homeViewPort: homeViewPort
    });

}