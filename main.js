import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";

var scene;
var camera;
var renderer;
var controls;
var directionalLight;
var ambientLight;

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(40, 40, 0);
  camera.lookAt(0, 0, 0);

  ambientLight = new THREE.AmbientLight(0xfcfcfc);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.target.applyMatrix4(
    new THREE.Matrix4().makeTranslation(2, -1, 0.2)
  );
  scene.add(directionalLight.target);
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  window.addEventListener("resize", resizeScene);

  scene.add(createSphere(10, 20, 10, 0x0a7030));

  scene.background = new THREE.Color(0xf0f0f0);
  renderer.render(scene, camera);
  animate();
}

function createSphere(radius, hlines, vlines, color) {
  var material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
  });
  var geometry_sphere = new THREE.SphereGeometry(radius, hlines, vlines);
  var s = new THREE.Mesh(geometry_sphere, material);
  s.position.z = 2;
  return s;
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