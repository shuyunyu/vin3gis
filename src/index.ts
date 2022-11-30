import * as THREE from 'three';
import { director, Director } from './core/director';
import { FrameRenderer } from './core/renderer/frame_renderer';
import { Engine } from './core/engine';
import { interactionSystem } from './core/system/interaction_system';
import { rendererSystem } from './core/system/renderer_system';
import { DebugTools } from './tools/debug_tools';
import { requestSystem } from './core/system/request_system';
import { RequestTaskResult } from './core/xhr/scheduler/@types/request';
import { SystemDefines } from './@types/core/system/system';
import { AssetLoader } from './core/asset/asset_loader';
import { CameraUtils } from './core/utils/camera_utils';
import { GeometryUtils } from './gis/utils/geometry_utils';
import { VecConstants } from './core/constants/vec_constants';
import { PerspectiveCamera, Vector3 } from 'three';
import { FrameState } from './gis/core/scene/frame_state';

const div1 = document.getElementById('output-div-1');
const div2 = document.getElementById('output-div-2');

Engine.init();
DebugTools.showStatsPanel();

// console.log(state);

// init

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
// const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
camera.position.z = 1;

const scene = new THREE.Scene();

// const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const geometry = new THREE.PlaneGeometry(1, 1);
const geometry1 = new THREE.PlaneGeometry(1, 1);
const box = GeometryUtils.createBox3(new Vector3(0.0, 0.1, 0.0), 0.1, 0.1, 0.1);


//http://webst02.is.autonavi.com/appmaptile?style=6&x=48&y=29&z=6
AssetLoader.loadRasterTileTexture({ url: "https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=27&TILEROW=12&TILEMATRIX=5&tk=1d109683f4d84198e37a38c442d68311" }).then(texture1 => {

    AssetLoader.loadRasterTileTexture({ url: "https://t3.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=27&TILEROW=12&TILEMATRIX=5&tk=1d109683f4d84198e37a38c442d68311" }).then(texture => {
        const material = new THREE.MeshBasicMaterial({ map: texture });

        const material1 = new THREE.MeshBasicMaterial({ map: texture1 });

        const mesh = new THREE.Mesh(geometry, material);
        const mesh1 = new THREE.Mesh(geometry1, material1);
        // mesh.position.y = 0.1
        scene.add(mesh);
        scene.add(mesh1);

        const gridHelper = new THREE.GridHelper(50, 50);
        // gridHelper.position.y = 0;
        scene.add(gridHelper);

        const mainFrameRenderer = new FrameRenderer(scene, camera, document.body);
        rendererSystem.addRenderTarget(mainFrameRenderer);

        interactionSystem.enableInteraction(mainFrameRenderer);

        global.mainFrameRenderer = mainFrameRenderer;
        global.rendererSystem = rendererSystem;
        global.interactionSystem = interactionSystem;


        director.addEventListener(Director.EVENT_BEGIN_FRAME, (dt: number) => {
            // let time = Date.now();
            // mesh.rotation.x = time / 2000;
            // mesh.rotation.y = time / 1000;

            //test frustum
            let start = performance.now();
            const frustum = CameraUtils.getFrustum(mainFrameRenderer.camera, false);
            console.log("intersect: ", frustum.intersectsBox(box), performance.now() - start);

            //test framestate
            start = performance.now();
            const frameState = new FrameState(mainFrameRenderer.camera as PerspectiveCamera, mainFrameRenderer.domElement);
            console.log("create frameState: ", performance.now() - start);
            frameState.endFrame();
        });
    });

});



// const frameRenderer1 = new FrameRenderer(scene, camera, div1);
// const frameRenderer2 = new FrameRenderer(scene, camera, div2);
// rendererSystem.render(frameRenderer1);
// rendererSystem.render(frameRenderer2);

// animation

// CameraControls.install({ THREE: THREE });
// const cameraControls = new CameraControls(mainFrameRenderer.camera, mainFrameRenderer.interactionElement);



director.once(Director.EVENT_DRAW_FRAME, () => {
    console.log("direction draw frame.")
})

// const testXHR = () => {
//     RequestTask.cerate({
//         taskType: "test",
//         url: "http://111.231.106.169/smedicalAPI/statistic/covid/global/v1/overall",
//         onComplete: (res: RequestTaskResult) => {
//             console.log(res);
//             // setTimeout(_ => {
//             //     testXHR();
//             // }, 100)
//         }
//     }).execute();
// }
// testXHR();



let totalRequestDown = 0;
const testRequest = (index: number) => {
    const z = Math.floor(Math.random() * 15);
    const x = Math.floor(Math.random() * 15);
    const y = Math.floor(Math.random() * 15);
    requestSystem.request({
        taskType: SystemDefines.RequestTaskeType.RASTER_TILE,
        imageTask: true,
        url: `http://webst03.is.autonavi.com/appmaptile?style=6&x=${x}&y=${y}&z=${z}`,
        priority: 1000 - index,
        throttle: true,
        throttleServer: true,
        onComplete: (res: RequestTaskResult) => {
            totalRequestDown++;
            console.log(`request [${index}] down. total: ${totalRequestDown}`, res);
            // setTimeout(_ => {
            //     testXHR();
            // }, 100)
        }
    });
}

globalThis.testRequest = () => {
    for (let i = 0; i < 100; i++) {
        testRequest(i);
    }
}

// globalThis.testCreateObj = () => {
//     const count = 50;
//     const list: Box3[] = [];
//     let start = performance.now();
//     for (let i = 0; i < count; i++) {
//         const box3 = new Box3(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
//         list.push(box3);
//     }
//     console.log(`创建${count}个,耗时[${performance.now() - start}] ms.`);
//     list.forEach(b => box3Pool.recycle(b));
//     start = performance.now();
//     for (let i = 0; i < count; i++) {
//         const box3 = box3Pool.create({ max: new Vector3(0, 0, 0), min: new Vector3(1, 1, 1) });
//     }
//     console.log(`从对象池创建${count}个,耗时[${performance.now() - start}] ms.`);
// }