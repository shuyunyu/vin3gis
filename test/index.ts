import { BoxGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, Euler, Float32BufferAttribute, Fog, FogExp2, FrontSide, Matrix3, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, Texture, Vector2, Vector3 } from "three";
import { AssetLoader, DRACOLoader, FileLoader, FrameRenderer, GLTFLoader, ImageBitmapLoader, ImageLoader, KTX2Loader, KTXLoader, math, OBB, requestSystem, TextureLoader, TiledTexture, VecConstants, XHRCancelToken, XHRResponseType } from "../src";
import { AMapImageryTileProvider, AnchorConstant, ArcGISImageryTileProvider, BillboardGeometry, Cartesian3, Cartographic, CoordinateTransform, Earth3DTile, EmptyImageryTileProvider, MapViewer, MultiPointGeometry, MultiPolygonGeometry, Orientation, OSMImageryTileProvider, TdtImageryTileProvider, ViewPort } from "../src/gis";

import verShader from "../src/gis/core/shader/tile.vt.glsl"
import fsShader from "../src/gis/core/shader/tile.fs.glsl"
import { GridImageryTileProvider } from "../src/gis/core/provider/grid_imagery_tile_provider";
import { createScheduler, removeScheduler } from "../src/core/utils/schedule_utils";
import { BaiduImageryTileProvider } from "../src/gis/core/provider/baidu_imagery_tile_provider";
import { BD09MercatorProject } from "../src/gis/core/projection/bd09_mercator_projection";
import { Transform } from "../src/gis/core/transform/transform";
import { Entity } from "../src/gis/core/datasource/entity";
import { PointGeometry } from "../src/gis/core/datasource/geometry/point_geometry";
import { PointCloudGeometry } from "../src/gis/core/datasource/geometry/point_cloud_geometry";
import { ColorUtils } from "../src/core/utils/color_utils";
import { ImageClipper } from "../src/gis/core/misc/image_clipper";
import { MultiBillboardGeometry } from "../src/gis/core/datasource/geometry/multi_billboard_geometry";
import { CanvasTextBuilder } from "../src/core/misc/canvas_text_builder";
import { LabelGeometry } from "../src/gis/core/datasource/geometry/label_geometry";
import { PolylineGeometry } from "../src/gis/core/datasource/geometry/polyline_geometry";
import { MultiPolylineGeometry } from "../src/gis/core/datasource/geometry/multi_polyline_geometry";
import { PolygonGeometry } from "../src/gis/core/datasource/geometry/polygon_geometry";
import { GeoJSONLoader } from "../src/gis/core/loader/geojson_loader";
import { PolygonShape } from "../src/gis/core/datasource/misc/polygon_shape";
import { SystemDefines } from "../src/@types/core/system/system";
import { xhrWorkerPool } from "../src/core/worker/pool/xhr_worker_pool";
import { Earth3DTileset } from "../src/gis/core/scene/3dtileset/earth_3dtileset";
import { InternalConfig } from "../src/gis/core/internal/internal_config";
import { CoordinateOffsetType } from "../src/gis/@types/core/gis";
import { Earth3DTilesetGltfUpAxis } from "../src/gis/@types/core/earth_3dtileset";
import { IEarth3DTileContent } from "../src/gis/core/scene/3dtileset/earth_3dtile_content";

window.onload = () => {
    InternalConfig.DEBUG = true;
    // const wgs84LngLat = CoordinateTransform.bd09towgs84(118.256, 24.418);
    // const initCameraPosition = new Vector3(wgs84LngLat[0], wgs84LngLat[1], 16500000);
    // const initCameraPosition = new Vector3(118.256, 24.418, 165000);
    const initCameraPosition = new Vector3(121.356, 31.268, 16500 * 3);
    // const initCameraPosition = new Vector3(102.65197, 25.073691, 1058.83878 * 1.5);
    // const initCameraPosition = new Vector3(0, 0, Transform.getMetersPerUnit() * 1.65);
    // const initCameraPosition = new Vector3(0, 0, Transform.carCoordToWorldCoord(1.65));
    const initCameraOrientation = new Vector3(0, -90, 0);
    // const initCameraOrientation = new Vector3(-27.330569, -47.4, 0);
    const homeViewPort = new ViewPort(Cartographic.fromDegrees(initCameraPosition.x, initCameraPosition.y, initCameraPosition.z), Orientation.fromDegreeEulerAngles(initCameraOrientation));
    const mapViewer = new MapViewer({
        target: document.body,
        //EmptyImageryTileProvider
        //AMapImageryTileProvider
        //TdtImageryTileProvider
        // imageryTileProivder: new AMapImageryTileProvider({ style: 'street' }),
        // imageryTileProivder: new BaiduImageryTileProvider({ correction: true }),
        // imageryTileProivder: new OSMImageryTileProvider(),
        imageryTileProivder: new AMapImageryTileProvider({ style: 'aerial' }),
        // imageryTileProivder: new GridImageryTileProvider(),
        // imageryTileProivder: new EmptyImageryTileProvider(),
        // imageryTileProivder: new ArcGISImageryTileProvider({ url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer", maximumLevel: 16 }),
        // imageryTileProivder: new TdtImageryTileProvider({
        //     style: "street",
        //     key: "1d109683f4d84198e37a38c442d68311",
        //     requestTileImageInWorker: false
        // }),
        // imageryTileProivder: new TencentImageryTileProvider({
        //     style: 'normal',
        // }),
        homeViewPort: homeViewPort,
        enablePan: true,
        enableZoom: true,
        enableRotate: true,
        enableDamping: true,
        camera: {
            // near: 0.00001
            near: 0.001
        }
        // dampingFactor: 0.1
        // maxDistance: 16000000
    });
    // mapViewer.scene.imageryProviders.add(new AMapImageryTileProvider({ style: 'note' }));
    // mapViewer.scene.imageryProviders.add(new GridImageryTileProvider());
    globalThis.mapViewer = mapViewer;
    GISTest.run(mapViewer.renderer, mapViewer);

    // mapViewer.renderer.scene.fog = new FogExp2(0xFF0000, 0.02);

}

class GISTest {

    public static run (render: FrameRenderer, mapViewer: MapViewer) {
        this.testXHRWorker();
        this.testEntity(mapViewer);
        // this.textDrawText();
        // this.testTiledTexture();
        // this.testImageClipper();
        // this.testDrawPoint(render);
        // this.testSchedule();
        // this.testShader(render);
        // this.testTileGeometry(render);
        // this.testWorker();
        // globalThis.testImageMerger = () => this.testWorker();
        // this.testDataTexture(render);
        this.testEngineLoader(mapViewer);
        this.test3dtiles(mapViewer);
        // this.testQXSY(mapViewer);
        // this.testOBB(mapViewer);
    }

    private static testEngineLoader (mapViewer: MapViewer) {

        //FileLoader

        // const fileLoader = new FileLoader();
        // fileLoader.setResponseType(XHRResponseType.ARRAYBUFFER);
        // fileLoader.setLoadInWorker(true);
        // fileLoader.setLoadParams({ params: { t: Date.now() } });
        // fileLoader.load("https://threejs.org/examples/models/draco/bunny.drc", (res: any) => {
        //     console.log("loaded: ", res);
        // }, (total, loaded) => {
        //     console.log("progress: ", total, loaded);
        // });


        //DRACOLoader

        // const dracoLoader = new DRACOLoader();
        // dracoLoader.setPath("https://threejs.org/examples/");
        // dracoLoader.setDecoderPath("http://124.223.202.45/Vin3GIS/v0.0.1/libs/draco/");
        // dracoLoader.setDecoderConfig({ type: "wasm" });
        // dracoLoader.load('models/draco/bunny.drc', function (geometry) {

        //     geometry.computeVertexNormals();

        //     const material = new MeshStandardMaterial({ color: 0x606060 });
        //     const mesh = new Mesh(geometry, material);
        //     mesh.scale.copy(new Vector3(10, 10, 10))
        //     mesh.castShadow = true;
        //     mesh.receiveShadow = true;
        //     mapViewer.renderer.scene.add(mesh);

        //     // Release decoder resources.
        //     dracoLoader.dispose();

        //     mapViewer.renderer.camera.position.set(3, 0.25, 3);
        //     mapViewer.renderer.camera.lookAt(0, 0.1, 0);
        //     mapViewer.renderer.camera.updateMatrixWorld();

        // });

        //ImageLoader

        // const imageLoader = new ImageLoader();
        // imageLoader.setLoadParams({ params: { t: Date.now() } });
        // imageLoader.load('http://124.223.202.45/VGIS-Examples/images/marker/marker-icon.png', (image: HTMLImageElement) => {
        //     console.log(image);
        // });

        //ImageBitmapLoader

        // const imageBitmapLoader = new ImageBitmapLoader();
        // imageBitmapLoader.setLoadInWorker(true);
        // imageBitmapLoader.load('http://124.223.202.45/VGIS-Examples/images/marker/marker-icon.png', (image: ImageBitmap) => {
        //     console.log(image);
        // })

        //TextureLoader
        // const textureLoader = new TextureLoader();
        // textureLoader.load('http://124.223.202.45/VGIS-Examples/images/marker/marker-icon.png', (texture: Texture) => {
        //     console.log(texture);
        // })


        //KTXLoader
        // const ktxLoader = new KTXLoader();
        // ktxLoader.setLoadInWorker(true);
        // ktxLoader.loadAsync("https://threejs.org/examples/textures/compressed/disturb_BC1.ktx").then((texture: Texture) => {
        //     const geometry = new PlaneGeometry();
        //     const material = new MeshBasicMaterial({
        //         color: 0xFFFFFF,
        //         side: DoubleSide
        //     });
        //     const mesh = new Mesh(geometry, material);
        //     material.map = texture;
        //     material.transparent = true;
        //     material.needsUpdate = true;
        //     mapViewer.renderer.scene.add(mesh);

        //     const camera = mapViewer.renderer.camera;
        //     const scene = mapViewer.renderer.scene;
        //     camera.position.set(2, 1.5, 1);
        //     camera.lookAt(scene.position);
        // });


        //KTX2Loader
        // const ktx2Loader = new KTX2Loader()
        //     .setTranscoderPath('http://124.223.202.45/Vin3GIS/v0.0.1/libs/basis/')
        //     .detectSupport(mapViewer.renderer.renderer);

        // ktx2Loader.loadAsync('https://threejs.org/examples/textures/compressed/sample_uastc_zstd.ktx2').then((texture: Texture) => {
        //     function flipY (geometry) {
        //         const uv = geometry.attributes.uv;
        //         for (let i = 0; i < uv.count; i++) {
        //             uv.setY(i, 1 - uv.getY(i));
        //         }
        //         return geometry;
        //     }
        //     const geometry = flipY(new PlaneGeometry());
        //     const material = new MeshBasicMaterial({
        //         color: 0xFFFFFF,
        //         side: DoubleSide
        //     });
        //     const mesh = new Mesh(geometry, material);
        //     material.map = texture;
        //     material.transparent = true;
        //     material.needsUpdate = true;
        //     mapViewer.renderer.scene.add(mesh);

        //     const camera = mapViewer.renderer.camera;
        //     const scene = mapViewer.renderer.scene;
        //     camera.position.set(2, 1.5, 1);
        //     camera.lookAt(scene.position);

        //     ktx2Loader.dispose();
        // })

        //GLTFLoader
        // const gltfLoader = new GLTFLoader();
        // gltfLoader.setPath('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/');
        // gltfLoader.loadAsync('DamagedHelmet.gltf').then(gltf => {
        //     console.log(gltf);
        // })

        //GLTFLoader .glb
        // const ktx2Loader = new KTX2Loader()
        //     .setTranscoderPath('http://124.223.202.45/Vin3GIS/v0.0.1/libs/basis/')
        //     .detectSupport(mapViewer.renderer.renderer);
        // const loader = new GLTFLoader();
        // loader.setKTX2Loader(ktx2Loader);
        // loader.load('https://threejs.org/examples/models/gltf/coffeemat.glb', function (gltf) {

        //     // coffeemat.glb was produced from the source scene using gltfpack:
        //     // gltfpack -i coffeemat/scene.gltf -o coffeemat.glb -cc -tc
        //     // The resulting model uses EXT_meshopt_compression (for geometry) and KHR_texture_basisu (for texture compression using ETC1S/BasisLZ)

        //     const camera = mapViewer.renderer.camera;
        //     mapViewer.renderer.scene.add(gltf.scene);
        //     camera.position.set(2, 500, 1);
        //     camera.lookAt(gltf.scene.position);

        //     ktx2Loader.dispose();

        //     console.log(gltf)

        // });

        //GLTFLoader .glb & DRACOLoader
        // const dracoLoader = new DRACOLoader()
        // dracoLoader.setPath("https://threejs.org/examples/");
        // dracoLoader.setDecoderPath("http://124.223.202.45/Vin3GIS/v0.0.1/libs/draco/");
        // const gltfLoader = new GLTFLoader();
        // gltfLoader.setDRACOLoader(dracoLoader);
        // gltfLoader.load('https://threejs.org/examples/models/gltf/IridescentDishWithOlives.glb', (gltf) => {
        //     dracoLoader.dispose();
        //     const camera = mapViewer.renderer.camera;
        //     mapViewer.renderer.scene.add(gltf.scene);
        //     camera.position.set(2, 0.5, 1);
        //     camera.lookAt(gltf.scene.position);
        //     console.log(gltf);
        // });

    }

    private static textDrawText () {
        const canvas = CanvasTextBuilder.buildTextCanvas('Vin3GIS001Vin3GIS001\nVin3GIS001', {
            backgroundColor: '#FF000022',
            lineHeight: 1
        }).canvas;
        canvas.style.border = "1px solid";
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
        canvas.style.position = "absolute";
        canvas.style.right = "10px";
        canvas.style.bottom = "10px";
        canvas.style.zIndex = "100";
        document.body.appendChild(canvas);
    }

    private static testEntity (mapViewer: MapViewer) {
        // this.testPointEntity(mapViewer);
        // this.testBillboardEntity(mapViewer);
        // this.testTextGeometry(mapViewer);
        // this.testPolygonGeometry(mapViewer);
        // this.testLineGeometry(mapViewer);
        // this.testLoader(mapViewer);
    }

    private static testLoader (mapViewer: MapViewer) {
        GeoJSONLoader.load({ url: "https://geojson.cn/api/data/china.json" }).then(res => {

        });
    }

    private static testPolygonGeometry (mapViewer: MapViewer) {
        const lnglats: number[][] = [
            [118.256, 24.418],
            [118.656, 24.418],
            [118.656, 24.118],
            [118.256, 24.118],
            [118.256, 24.418],
        ];
        const offset = 0.08;
        const holeslnglats: number[][] = [
            [118.256 + offset, 24.418 - offset],
            [118.656 - offset, 24.418 - offset],
            [118.656 - offset, 24.118 + offset],
            [118.256 + offset, 24.118 + offset],
            [118.256 + offset, 24.418 - offset],
        ];
        const entity = new Entity({
            polygon: new PolygonGeometry({
                shapes: [new PolygonShape(
                    lnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0], lnglat[1], 0)),
                    // [holeslnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0], lnglat[1], 0))]
                ), new PolygonShape(
                    lnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0] + 0.5, lnglat[1], 0))
                )],
                color: new Color("#FF0000"),
                // emissive: new Color("#00FFFF"),
                height: 0,
                extrudedHeight: 10000,
                effectedByLight: true,
                // opacity: 0.5
                // material: new MeshLambertMaterial({
                //     color: new Color("#FFFF00"),
                //     depthTest: false,
                //     transparent: true,
                //     // side: DoubleSide
                // })
            })
        });
        mapViewer.scene.entities.add(entity);
        globalThis.polygonEntity = entity;

        // const newLngLats = [].concat(lnglats);
        // setTimeout(() => {
        //     entity.polygon.positions = newLngLats.map(lnglat => Cartographic.fromDegrees(lnglat[0] - 0.1, lnglat[1] - 0.1, 0)).reverse();
        // }, 1000 * 1);
        return;
        GeoJSONLoader.loadSourceData({ url: "https://geojson.cn/api/data/china.json" }).then((json: any) => {
            const positionsArray = [];
            const features = json.features;
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const geometry = feature.geometry;
                if (geometry && geometry.type === "Polygon") {
                    const coordinates = geometry.coordinates;
                    const positions = [];
                    for (let j = 0; j < coordinates.length; j++) {
                        const coordArr = coordinates[j];
                        coordArr.forEach(coord => {
                            positions.push(Cartographic.fromDegrees(coord[0], coord[1], 0));
                        });
                    }
                    positionsArray.push(positions);
                } else if (geometry && geometry.type === "MultiPolygon") {
                    const rings = geometry.coordinates;
                    rings.forEach(ring => {
                        ring.forEach(coordinates => {
                            const positions = [];
                            for (let j = 0; j < coordinates.length; j++) {
                                const coord = coordinates[j];
                                positions.push(Cartographic.fromDegrees(coord[0], coord[1], 0));
                            }
                            positionsArray.push(positions);
                        });
                    });
                }
            }
            mapViewer.scene.entities.suspendEvents();
            const colors = [
                new Color("#FF0000"),
                new Color("#FFFF00"),
                new Color("#00FF00"),
                new Color("#00FFFF")
            ]
            // positionsArray.forEach(positions => {
            //     const extrudedHeight = 100000;
            //     const e = new Entity({
            //         polygon: new PolygonGeometry({
            //             positions: positions,
            //             color: colors[Math.floor(Math.random() * 4)],
            //             extrudedHeight: extrudedHeight,
            //             height: -extrudedHeight / 2
            //         })
            //     });
            //     mapViewer.scene.entities.add(e);
            // })

            const colorArray = positionsArray.map((_, index) => colors[index % colors.length]);
            const multiPolygonEntity = new Entity({
                multiPolygon: new MultiPolygonGeometry({
                    // positions: positionsArray,
                    shapes: positionsArray.map(positions => new PolygonShape(positions)),
                    colors: colorArray,
                    extrudedHeights: positionsArray.map(_ => 10000),
                    opacities: positionsArray.map(_ => 0.5),
                    emissives: colorArray,
                    effectedByLights: positionsArray.map(_ => true)
                })
            })
            mapViewer.scene.entities.add(multiPolygonEntity);
            mapViewer.scene.entities.resumeEvents();
        })

    }

    private static testLineGeometry (mapViewer: MapViewer) {
        const lnglats: number[][] = [
            [118.256, 24.418],
            [118.356, 24.418],
            [118.356, 24.318],
            [118.556, 24.318],
        ];
        const entity = new Entity({
            polyline: new PolylineGeometry({
                positions: lnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0], lnglat[1], 0)),
                color: new Color('#FF0000'),
                width: 3,
                useVertexColor: true,
                vertexColors: [
                    new Color('#FF0000'),
                    new Color('#00FF00'),
                    new Color('#0000FF'),
                    new Color('#00FFFF')
                ],
                dashed: false,
                dashOffset: 0,
                dashSize: 2,
                dashScale: 2
            })
        });
        mapViewer.scene.entities.add(entity);
        globalThis.lineEneity = entity;

        const positionsArray = [
            lnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0], lnglat[1] - 0.2, 0)),
            lnglats.map(lnglat => Cartographic.fromDegrees(lnglat[0], lnglat[1] + 0.2, 0))
        ]

        const entity1 = new Entity({
            multiPolyline: new MultiPolylineGeometry({
                positions: positionsArray,
                colors: [new Color("#00FF00"), new Color("#0000FF")],
                widths: [1, 5],
                useVertexColors: [true, false],
                vertexColors: [
                    [
                        new Color('#FF0000'),
                        new Color('#00FF00'),
                        new Color('#0000FF'),
                        new Color('#00FFFF')
                    ].reverse(),
                    []
                ],
                dasheds: [true],
                dashSizes: [1],
                dashScales: [2]
            })
        });
        mapViewer.scene.entities.add(entity1);
        globalThis.multiLineEntity = entity1;

        AssetLoader.loadJSON({ url: "https://geojson.cn/api/data/china.json" }).then((json: any) => {
            const positionsArray = [];
            const features = json.features;
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const geometry = feature.geometry;
                if (geometry && geometry.type === "Polygon") {
                    const coordinates = geometry.coordinates;
                    const positions = [];
                    for (let j = 0; j < coordinates.length; j++) {
                        const coordArr = coordinates[j];
                        coordArr.forEach(coord => {
                            positions.push(Cartographic.fromDegrees(coord[0], coord[1], 0));
                        });
                    }
                    positionsArray.push(positions);
                } else if (geometry && geometry.type === "MultiPolygon") {
                    const rings = geometry.coordinates;
                    rings.forEach(ring => {
                        ring.forEach(coordinates => {
                            const positions = [];
                            for (let j = 0; j < coordinates.length; j++) {
                                const coord = coordinates[j];
                                positions.push(Cartographic.fromDegrees(coord[0], coord[1], 0));
                            }
                            positionsArray.push(positions);
                        });
                    });
                }
            }
            const jsonEntity = new Entity({
                multiPolyline: new MultiPolylineGeometry({
                    positions: positionsArray,
                    // colors: positionsArray.map(_ => new Color("#FFFF00")),
                    colors: positionsArray.map(_ => new Color("#444444")),
                    // widths: positionsArray.map(_ => 2)
                })
            })
            mapViewer.scene.entities.add(jsonEntity);
        });

    }

    private static testTextGeometry (mapViewer: MapViewer) {
        const lng = 118.256;
        const lat = 24.418;
        const pos = Cartographic.fromDegrees(lng, lat, 0);
        const entity = new Entity({
            label: new LabelGeometry({
                position: pos,
                text: "Vin3GIS001Vin3GIS001\nVin3GIS001",
                fontSize: 18,
                fontColor: new Color("#FF0000"),
                shadowColor: new Color("#00FFFF"),
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                shadowBlur: 1,
                pixelOffsetY: -41,
                pixelOffsetX: 0,
                // rotation: math.toRadian(45),
                anchor: { x: 0.5, y: 0 }
            })
        });
        mapViewer.scene.entities.add(entity);

        const pos1 = Cartographic.fromDegrees(lng, lat + 0.1, 0);
        const entity1 = new Entity({
            point: new PointGeometry({
                position: pos1,
                size: 10,
                color: new Color("#FF0000")
            }),
            label: new LabelGeometry({
                position: pos1,
                text: "Vin3GIS002",
            })
        });

        mapViewer.scene.entities.add(entity1);

        const pos2 = Cartographic.fromDegrees(lng, lat - 0.1, 0);
        const entity2 = new Entity({
            point: new PointGeometry({
                position: pos2,
                size: 10,
                color: new Color("#FF0000")
            }),
            label: new LabelGeometry({
                position: pos2,
                text: "Vin3GIS003",
            })
        });

        mapViewer.scene.entities.add(entity2);

        globalThis.mapViewer = mapViewer;
        globalThis.textEntity = entity;
    }

    private static testBillboardEntity (mapViewer: MapViewer) {
        const lng = 118.256;
        const lat = 24.418;
        const pos = Cartographic.fromDegrees(lng, lat, 0);
        const imageSrc = "http://124.223.202.45/VGIS-Examples/images/marker/marker-icon.png";
        const entity = new Entity({
            billboard: new BillboardGeometry({
                position: pos,
                image: imageSrc,
                width: 25,
                height: 41,
                rotation: math.toRadian(0),
                scale: 1,
                anchor: AnchorConstant.CenterBottom
            })
        })
        mapViewer.scene.entities.add(entity);
        const entity1 = new Entity({
            point: new PointGeometry({
                position: pos,
                size: 10,
                color: new Color("#FF0000")
            })
        });
        mapViewer.scene.entities.add(entity1);
        globalThis.billboardEntity = entity;


        // test MultiBillboard

        // const positions = [];
        // const rotations = [];
        // const scales = [];
        // const anchors = [];
        // const count = 1000;
        // const d = 2;
        // for (let i = 0; i < count; i++) {
        //     const factor = Math.random() > 0.5 ? 1 : -1;
        //     const cLng = lng + Math.random() * d * factor;
        //     const cLat = lat + Math.random() * d * 0.1 * factor;
        //     positions.push(Cartographic.fromDegrees(cLng, cLat, 0));
        //     // rotations.push(math.toRadian(Math.random() * 90));
        //     scales.push(Math.max(0.7, Math.random()));
        //     anchors.push({ x: 0.5, y: 0.0 });
        // }

        // mapViewer.scene.entities.add(new Entity({
        //     billboard: new MultiBillboardGeometry({
        //         image: imageSrc,
        //         anchors: anchors,
        //         positions: positions,
        //         rotations: rotations,
        //         scales: scales
        //     })
        // }));

    }

    private static testPointEntity (mapViewer: MapViewer) {
        const entity = new Entity({
            point: new PointGeometry({
                position: Cartographic.fromDegrees(118.256, 24.418, 0),
                size: 30,
                color: new Color("#FF0000"),
                outline: true,
                outlineSize: 5,
                outlineColor: new Color("#00FFFF")
            })
        });
        mapViewer.scene.entities.add(entity);
        globalThis.pointEntity = entity;
        mapViewer.scene.entities.suspendEvents();
        const pointCount = 100;
        // for (let i = 0; i < pointCount; i++) {
        //     const lng = 118.256 + Math.random() * 0.5;
        //     const lat = 24.418 + Math.random() * 0.1;
        //     const pos = Cartographic.fromDegrees(lng, lat, 0);
        //     const entity = new Entity({
        //         point: new PointGeometry({
        //             position: pos,
        //             size: 10,
        //             color: new Color("#00FFFF")
        //         })
        //     });
        //     mapViewer.scene.entities.add(entity);
        // }

        //MultiPointGeometry
        const posArr = [];
        const scales = [];
        for (let i = 0; i < pointCount; i++) {
            const lng = 118.256 - Math.random() * 0.5;
            const lat = 24.418 - Math.random() * 0.1;
            const pos = Cartographic.fromDegrees(lng, lat, 0);
            posArr.push(pos);
            scales.push(Math.max(0.5, Math.random()))
        }
        mapViewer.scene.entities.add(new Entity({
            multiPoint: new MultiPointGeometry({
                positions: posArr,
                scales: scales,
                size: 20,
                color: new Color("#FF0000")
            })
        }));

        //PointCloudGeometry
        const posArray = [];
        const colorArray = [];
        const count = 100000;
        for (let i = 0; i < count; i++) {
            const lng = 118.256 - Math.random() * 0.5;
            const lat = 24.228 - Math.random() * 0.1;
            posArray.push(Cartographic.fromDegrees(lng, lat, 0));
            colorArray.push(ColorUtils.randomColor());
        }

        mapViewer.scene.entities.add(new Entity({
            pointCloud: new PointCloudGeometry({
                size: 0.05,
                positions: posArray,
                colors: colorArray
            })
        }))

        mapViewer.scene.entities.resumeEvents();
    }

    private static testImageClipper () {
        const image = "http://124.223.202.45/VGIS-Examples/images/marker/markers.png";
        const imageClipper = new ImageClipper(image);
        imageClipper.init().then(() => {
            imageClipper.clip(42, 0, 21, 32).then(image => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.style.width = canvas.width + "px";
                canvas.style.height = canvas.height + "px";
                canvas.style.position = "absolute";
                canvas.style.right = "10px";
                canvas.style.bottom = "10px";
                canvas.style.zIndex = "100";
                canvas.style.border = "1px solid";
                document.body.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);

            });
        });
    }

    private static testDrawPoint (render: FrameRenderer) {
        var texture: Texture;
        var matContext: CanvasRenderingContext2D;
        var matCanvas: HTMLCanvasElement;
        function createCanvasMaterial (color: string, size: number) {
            matCanvas = document.createElement('canvas');
            matCanvas.width = matCanvas.height = size;
            matContext = matCanvas.getContext('2d');
            // create exture object from canvas.
            texture = new Texture(matCanvas);
            // Draw a circle
            drawCircle(color, size);
            // need to set needsUpdate
            // texture.needsUpdate = true;
            // return a texture made from the canvas
            return texture;
        }

        function drawCircle (color: string, size: number) {
            var center = size / 2;
            matContext.clearRect(0, 0, matCanvas.width, matCanvas.height);
            matContext.beginPath();
            matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
            matContext.closePath();
            matContext.fillStyle = color;
            matContext.fill();
            texture.needsUpdate = true;
        }

        globalThis.drawCircle = drawCircle;

        const vertices = new Float32Array([0, 0, 0]);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        // const sprite = new TextureLoader().load('./disc.png');
        const mtl = new PointsMaterial({
            size: 10,
            sizeAttenuation: false,
            map: createCanvasMaterial("#FF0000", 256),
            transparent: true
        });
        const pts = new Points(geometry, mtl);
        pts.renderOrder = 2;
        render.scene.add(pts);
    }

    private static testSchedule () {
        let start = performance.now();
        let count = 0;
        let id = createScheduler(() => {
            const now = performance.now();
            console.log("schedule: ", now - start);
            start = now;
            count++;
            if (count == 10) {
                removeScheduler(id);
            }
        }, 30)
    }

    private static testXHRWorker () {
        globalThis.testXHRWorker = () => {
            const url = "https://webst04.is.autonavi.com/appmaptile?style=6&x=33&y=30&z=6";
            xhrWorkerPool.getInstance().create({
                url: url,
                params: {},
                responseType: XHRResponseType.BLOB,
                cancelToken: new XHRCancelToken((cancelFunc: Function) => {
                    // cancelFunc();
                })
            }).then(res => {
                console.log("xhrWorker", res);
            }).catch(err => {
                console.error(err);
            });
        }
        globalThis.testXHRArrayBuffer = () => {
            requestSystem.request({
                url: "https://threejs.org/examples/models/draco/bunny.drc?t=" + Date.now(),
                responseType: XHRResponseType.ARRAYBUFFER,
                taskType: SystemDefines.RequestTaskeType.ARRAYBUFFER,
                onComplete: () => {
                    console.log("onComplete");
                },
                requestInWorker: true,
                onProgress: (total: number, loaded: number) => {
                    console.log("onProgress: total: " + total + " loaded: " + loaded);
                }
            })
        }
    }

    private static testShader (render: FrameRenderer) {
        const geo0 = new PlaneGeometry(10, 10).rotateX(-math.PI_OVER_TWO);
        // geo0.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), 2));
        geo0.setAttribute('a_overlay_uv', new BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), 2));
        const box = new Mesh(
            geo0,
            new ShaderMaterial({
                uniforms: {
                    u_texture1: {
                        value: new TextureLoader().load("https://webst04.is.autonavi.com/appmaptile?style=6&x=33&y=30&z=6")
                    },
                    u_texture2: {
                        value: new TextureLoader().load("https://webst03.is.autonavi.com/appmaptile?x=33&y=30&z=6&lang=zh_cn&size=1&scale=1&style=8")
                    },
                    u_base: { value: 1.0 },
                    u_overlay: { value: 1.0 },
                },
                vertexShader: verShader,
                fragmentShader: fsShader,
                side: FrontSide,
                transparent: true
            })
        );
        render.scene.add(box);

        const geo1 = new PlaneGeometry(10, 10).rotateX(-math.PI_OVER_TWO);
        // geo1.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), 2));
        geo1.setAttribute('a_overlay_uv', new BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), 2));
        const box1 = new Mesh(geo1,
            new ShaderMaterial({
                uniforms: {
                    u_texture1: {
                        value: new TextureLoader().load("https://webst04.is.autonavi.com/appmaptile?style=6&x=33&y=30&z=6")
                    },
                    u_texture2: {
                        value: new TextureLoader().load("https://webst03.is.autonavi.com/appmaptile?x=33&y=30&z=6&lang=zh_cn&size=1&scale=1&style=8")
                    },
                    u_base: { value: 0.0 },
                    u_overlay: { value: 1.0 },
                },
                vertexShader: verShader,
                fragmentShader: fsShader,
                side: FrontSide,
                transparent: true
            })
        );
        box1.position.x = 10;
        render.scene.add(box1);
    }

    private static testTileGeometry (render: FrameRenderer) {
        // const tileGeometry = TileGeometryFactory.createGeometry();
        // const url1 = "https://webst04.is.autonavi.com/appmaptile?style=6&x=33&y=30&z=6";
        // const url2 = "https://webst03.is.autonavi.com/appmaptile?x=33&y=32&z=6&lang=zh_cn&size=1&scale=1&style=8";
        // const blobsPromiseArr = [url1, url2].map(url => AssetLoader.requestImageBlob({ url: url }));
        // Promise.all(blobsPromiseArr).then(resArr => {
        //     const blobs = resArr.map(res => res.image);
        //     imageDecoder.imageBlobToImageBitMapMulti(blobs).then(images => {
        //         const texture = new Texture(images[0]);
        //         texture.needsUpdate = true;
        //         const mtl = new MeshBasicMaterial({ map: texture, transparent: true, side: FrontSide });
        //         mtl.needsUpdate = true;

        //         const texture2 = new Texture(images[1]);
        //         texture2.needsUpdate = true;
        //         const mtl2 = new MeshBasicMaterial({ map: texture2, transparent: true, side: FrontSide });
        //         mtl2.needsUpdate = true;

        //         const mesh = new Mesh(tileGeometry, mtl);
        //         mesh.position.y = 0;
        //         mesh.scale.copy(new Vector3(100, 100, 100));

        //         const mesh1 = new InstancedMesh(tileGeometry, mtl, 2);
        //         mesh1.position.y = 0;
        //         // mesh1.scale.copy(new Vector3(100, 100, 100));

        //         const o = new Object3D();

        //         const matrix2 = new Matrix4();
        //         const pos0 = new Vector3(0, 0, 0);
        //         matrix2.compose(pos0, new Quaternion(), new Vector3(100, 100, 100));

        //         const matrix1 = new Matrix4();
        //         const pos = new Vector3(200, 0, 0);
        //         matrix1.compose(pos, new Quaternion(), new Vector3(100, 100, 100));

        //         mesh1.setMatrixAt(0, matrix2);
        //         mesh1.setMatrixAt(1, matrix1);
        //         mesh1.instanceMatrix.needsUpdate = true;

        //         // o.add(mesh);
        //         o.add(mesh1);


        //         render.scene.add(o);
        //     })
        // })
    }

    private static testWorker () {
        // const url1 = "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=52&y=28&z=6";
        // const url2 = "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=53&y=28&z=6";
        // const url3 = "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=51&y=27&z=6";
        // const url4 = "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=54&y=27&z=6";

        // const urls = [url1, url2, url3, url4];
        // const promiseArr = urls.map(url => AssetLoader.requestImageBlob({ url: url }));
        // const opts: ImageBitmapOptions[] = urls.map(url => {
        //     return { imageOrientation: 'none' };
        // })
        // Promise.all(promiseArr).then(resArr => {
        //     const blobs = resArr.map(res => res.image);
        //     const start = performance.now();
        //     imageMerger.merge(blobs, 2, 2, 256, 256, opts).then(img => {
        //         console.log('merge images: ', performance.now() - start);
        //         const canvas = document.createElement('canvas');
        //         canvas.style.position = "absolute";
        //         canvas.style.right = "10px";
        //         canvas.style.bottom = "10px";
        //         canvas.style.zIndex = "10000";
        //         canvas.width = img.width;
        //         canvas.height = img.height;
        //         canvas.style.border = "1px solid"
        //         document.body.appendChild(canvas);
        //         canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        //     });
        // });
    }

    private static testDataTexture (render: FrameRenderer) {
        // const width = 512;
        // const height = 512;

        // const size = width * height;
        // const data = new Uint8Array(4 * size);
        // const color = new Color(0xffffff);

        // const r = Math.floor(color.r * 255);
        // const g = Math.floor(color.g * 255);
        // const b = Math.floor(color.b * 255);

        // for (let i = 0; i < size; i++) {

        //     const stride = i * 4;

        //     data[stride] = r;
        //     data[stride + 1] = g;
        //     data[stride + 2] = b;
        //     data[stride + 3] = 255;

        // }

        // // used the buffer to create a DataTexture

        // const texture = new DataTexture(data, width, height);
        // texture.needsUpdate = true;

        // const w = 100000;
        // const box = new BoxGeometry(w, w, w);
        // const mtl = new MeshBasicMaterial({ map: texture });

        // const mesh = new Mesh(box, mtl);

        // render.scene.add(mesh);

        // director.addEventListener(Director.EVENT_BEGIN_FRAME, () => {
        //     for (let i = 0; i < size; i++) {

        //         const stride = i * 4;
        //         const r = Math.random() * 255;
        //         const g = Math.random() * 255;
        //         const b = Math.random() * 255;
        //         data[stride] = r;
        //         data[stride + 1] = g;
        //         data[stride + 2] = b;
        //         data[stride + 3] = 255;
        //         texture.needsUpdate = true;

        //     }
        // }, this);
    }

    private static testTiledTexture () {
        const tiledTexture = new TiledTexture(1024, 256);
        const canvas = tiledTexture.canvas;
        canvas.style.border = "1px solid";
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
        canvas.style.position = "absolute";
        canvas.style.right = "10px";
        canvas.style.top = "10px";
        canvas.style.zIndex = "100";
        document.body.appendChild(canvas);

        const res1 = CanvasTextBuilder.buildTextCanvas('hello world!\nhello', {
            backgroundColor: '#FF000022',
            lineHeight: 1
        });
        console.log(tiledTexture.tileImage(res1.canvas));

        const res2 = CanvasTextBuilder.buildTextCanvas(`Canvas.style.position = "absolute";`, {
            lineHeight: 1,
            backgroundColor: '#FF000022',
        });
        console.log(tiledTexture.tileImage(res2.canvas));

        globalThis.tiledTexture = tiledTexture;
    }

    public static test3dtiles (mapViewer: MapViewer) {
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath("http://124.223.202.45/Vin3GIS/v0.0.1/libs/draco/");
        const tileset = new Earth3DTileset({
            url: 'http://data.mars3d.cn/3dtiles/jzw-shanghai/tileset.json',
            dracoLoader: dracoLoader,
            coordinateOffsetType: CoordinateOffsetType.GCJ02,
            customMaterial: (tileset: Earth3DTileset, tile: Earth3DTile, content: IEarth3DTileContent) => {
                return InternalConfig.getB3dmMaterial();
            },
            // skipLevelOfDetail: true,
            // maximumScreenSpaceError: 10,
            // immediatelyLoadDesiredLevelOfDetail: true
        });
        tileset.adjustHeight(71);
        mapViewer.scene.primitives.add(tileset);
    }

    public static testQXSY (mapViewer: MapViewer) {
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath("http://124.223.202.45/Vin3GIS/v0.0.1/libs/draco/");
        const tileset = new Earth3DTileset({
            url: 'http://data.mars3d.cn/3dtiles/qx-xiaoqu/tileset.json',
            dracoLoader: dracoLoader,
            coordinateOffsetType: CoordinateOffsetType.GCJ02,
            maximumMemoryUsage: 1024,
            maximumScreenSpaceError: 128
            // skipLevelOfDetail: true,
            // maximumScreenSpaceError: 10,
            // immediatelyLoadDesiredLevelOfDetail: true
        });
        tileset.adjustHeight(50);
        mapViewer.scene.primitives.add(tileset);
    }


    public static testOBB (mapViewer: MapViewer) {
        const euler = new Euler(math.toRadian(0), math.toRadian(45), math.toRadian(0));
        const rotMat = new Matrix4().makeRotationFromEuler(euler);
        const halfAxis = new Matrix3().setFromMatrix4(rotMat);
        const halfSize = new Vector3(1, 0.5, 0.1);
        const obb = new OBB(new Vector3(), halfSize, halfAxis);
        const box = new BoxGeometry(obb.halfSize.x * 2, obb.halfSize.y * 2, obb.halfSize.z * 2);
        const mesh = new Mesh(box, InternalConfig.get3dtileBoundingVolumeMaterial());
        const meshMat = new Matrix4().setFromMatrix3(obb.rotation);
        meshMat.setPosition(obb.center);
        mesh.applyMatrix4(meshMat);
        mapViewer.renderer.scene.add(mesh);
    }

}