import * as THREE from 'three';
import { director, Director } from './core/director';
import { FrameRenderer } from './core/renderer/frame_renderer';
import { Game } from './core/system/game';
import { rendererSystem } from './core/system/renderer_system';
import { DebugTools } from './tools/debug_tools';

const div1 = document.getElementById('output-div-1');
const div2 = document.getElementById('output-div-2');

Game.start();
DebugTools.showStatsPanel();

// console.log(state);

// init

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const mainFrameRenderer = new FrameRenderer(scene, camera, document.body);
rendererSystem.addRenderTarget(mainFrameRenderer);

global.rendererSystem = rendererSystem;

// const frameRenderer1 = new FrameRenderer(scene, camera, div1);
// const frameRenderer2 = new FrameRenderer(scene, camera, div2);
// rendererSystem.render(frameRenderer1);
// rendererSystem.render(frameRenderer2);

// animation

director.addEventListener(Director.EVENT_DRAW_FRAME, () => {
    let time = Date.now();
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;
})

director.once(Director.EVENT_DRAW_FRAME, () => {
    console.log("direction draw frame.")
})
