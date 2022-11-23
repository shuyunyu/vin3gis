import * as THREE from 'three';
import { Director, director } from './core/director';
import { DebugTools } from './tools/debug_tools';

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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// animation

director.addEventListener(Director.EVENT_DRAW_FRAME, (time) => {
    time = Date.now();
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    renderer.render(scene, camera);
})

director.once(Director.EVENT_DRAW_FRAME, () => {
    console.log("direction draw frame.")
})
