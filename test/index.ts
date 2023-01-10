import { BoxGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, Float32BufferAttribute, FrontSide, Mesh, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, Texture, TextureLoader, Vector3 } from "three";
import { FrameRenderer, math, VecConstants, XHRCancelToken, XHRResponseType } from "../src";
import { AMapImageryTileProvider, Cartographic, CoordinateTransform, EmptyImageryTileProvider, MapViewer, Orientation, OSMImageryTileProvider, TdtImageryTileProvider, ViewPort } from "../src/gis";

import verShader from "../src/gis/core/shader/tile.vt.glsl"
import fsShader from "../src/gis/core/shader/tile.fs.glsl"
import { xhrWorker } from "../src/core/worker/xhr_worker";
import { GridImageryTileProvider } from "../src/gis/core/provider/grid_imagery_tile_provider";
import { createScheduler, removeScheduler } from "../src/core/utils/schedule_utils";
import { BaiduImageryTileProvider } from "../src/gis/core/provider/baidu_imagery_tile_provider";
import { BD09MercatorProject } from "../src/gis/core/projection/bd09_mercator_projection";
import { Transform } from "../src/gis/core/transform/transform";
import { Entity } from "../src/gis/core/datasource/entity";
import { PointGeometry } from "../src/gis/core/datasource/geometry/point_geometry";

window.onload = () => {
    // const wgs84LngLat = CoordinateTransform.bd09towgs84(118.256, 24.418);
    // const initCameraPosition = new Vector3(wgs84LngLat[0], wgs84LngLat[1], 16500000);
    const initCameraPosition = new Vector3(118.256, 24.418, 165000);
    // const initCameraPosition = new Vector3(0, 0, 16500000);
    const initCameraOrientation = new Vector3(0, -90, 0);
    const homeViewPort = new ViewPort(Cartographic.fromDegrees(initCameraPosition.x, initCameraPosition.y, initCameraPosition.z), Orientation.fromDegreeEulerAngles(initCameraOrientation));
    const mapViewer = new MapViewer({
        target: document.body,
        //EmptyImageryTileProvider
        //AMapImageryTileProvider
        //TdtImageryTileProvider
        imageryTileProivder: new AMapImageryTileProvider({ style: 'street' }),
        // imageryTileProivder: new BaiduImageryTileProvider({ correction: true }),
        // imageryTileProivder: new OSMImageryTileProvider(),
        // imageryTileProivder: new AMapImageryTileProvider({ style: 'aerial' }),
        // imageryTileProivder: new GridImageryTileProvider(),
        // imageryTileProivder: new EmptyImageryTileProvider(),
        // imageryTileProivder: new ArcGISImageryTileProvider({
        //     url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
        //     // token: '1d109683f4d84198e37a38c442d68311'
        // }),
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
        enableDamping: true
        // dampingFactor: 0.1
        // maxDistance: 16000000
    });
    // mapViewer.scene.imageryProviders.add(new AMapImageryTileProvider({ style: 'note' }));
    // mapViewer.scene.imageryProviders.add(new GridImageryTileProvider());
    global.mapViewer = mapViewer;
    GISTest.run(mapViewer.renderer, mapViewer);
}

class GISTest {

    public static run (render: FrameRenderer, mapViewer: MapViewer) {
        this.testXHRWorker();
        // this.testEntity(mapViewer);
        // this.testDrawPoint(render);
        // this.testSchedule();
        // this.testShader(render);
        // this.testTileGeometry(render);
        // this.testWorker();
        // global.testImageMerger = () => this.testWorker();
        // this.testDataTexture(render);
    }

    private static testEntity (mapViewer: MapViewer) {
        const entity = new Entity({
            point: new PointGeometry({
                position: Cartographic.fromDegrees(118.256, 24.418, 0),
                size: 10
            })
        });
        mapViewer.scene.entities.add(entity);
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
            size: 1 * Transform.THREEJS_UNIT_PER_METERS / 100,
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
            xhrWorker.create({
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

}