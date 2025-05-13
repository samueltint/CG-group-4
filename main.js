import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import BlockGenerator from "./Generation/BlockGenerator";

var scene;
var camera;
var renderer;
var controls;
var directionalLight;
var ambientLight;

var mapSize = 300;
let currentRoadMapMesh = null;

var maxBuildingSideLength = 10;
var startingRoadWidth = 10;
var roadWidthDecay = 1;

init();

async function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e9f0);

  await initUI();

  // camera settings
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(100, 60, 40);
  camera.lookAt(0, 0, 0);

  // lighting
  directionalLight = new THREE.DirectionalLight(0xfffffc, 3);
  directionalLight.position.set(200, 200, 200);
  directionalLight.castShadow = true;
  directionalLight.shadow.bias = 0.0001;
  directionalLight.shadow.mapSize.set(8192, 8192);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -mapSize / 1.4;
  directionalLight.shadow.camera.right = mapSize / 1.4;
  directionalLight.shadow.camera.top = mapSize / 1.4;
  directionalLight.shadow.camera.bottom = -mapSize / 1.4;
  scene.add(directionalLight);
  scene.add(directionalLight.target);
  ambientLight = new THREE.AmbientLight(0xfcfcfc);
  scene.add(ambientLight);
  // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
  // scene.add(new THREE.DirectionalLightHelper(directionalLight));

  // render settings
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  const roadMap = new BlockGenerator();
  roadMap.Generate(mapSize, maxBuildingSideLength, startingRoadWidth, roadWidthDecay);
  currentRoadMapMesh = roadMap.getGroup();
  scene.add(currentRoadMapMesh);

  window.addEventListener("resize", resizeScene);
  renderer.render(scene, camera);
  animate();
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

var resizeScene = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
};

async function initUI() {
  const buildingSizeInput = document.getElementById("buildingSizeInput");
  const roadSizeInput = document.getElementById("roadSizeInput");
  const roadSizeDecayInput = document.getElementById("roadSizeDecayInput");
  const generateBtn = document.getElementById("generateBtn");

  buildingSizeInput.addEventListener("input", (event) => {
    maxBuildingSideLength = parseInt(event.target.value);
  });

  roadSizeInput.addEventListener("input", (event) => {
    startingRoadWidth = parseInt(event.target.value);
  });

  roadSizeDecayInput.addEventListener("input", (event) => {
    roadWidthDecay = parseInt(event.target.value);
  });

  generateBtn.addEventListener("click", () => {
    if (currentRoadMapMesh) {
      scene.remove(currentRoadMapMesh);

      currentRoadMapMesh.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    const roadMap = new BlockGenerator();
    roadMap.Generate(mapSize, maxBuildingSideLength, startingRoadWidth, roadWidthDecay);
    currentRoadMapMesh = roadMap.getGroup();
    scene.add(currentRoadMapMesh);
  });
}

export { init };
