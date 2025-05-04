import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import buildings from "./buildings";

var scene;
var camera;
var renderer;
var controls;
var directionalLight;
var ambientLight;

var floor;
var cursor = new THREE.Object3D();
var axesHelper;
var placementHelper;
var cursorBuilding;
var currentBuildingId = 0;
let gridHelper;
const cellMarkers = [];
var showGrid = true;
var rotation = 0;

var mapSize = 75;
const gridSize = 1;
const gridWidth = mapSize / gridSize;
const grid = new Array(gridWidth)
  .fill(null)
  .map(() => new Array(gridWidth).fill(null));
const floorSegments = 500;

const markerMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.5,
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

init();

async function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e9f0);

  // camera settings
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(40, 20, 10);
  camera.lookAt(0, 0, 5);

  // async function to load models before allowing interaction
  await loadAllModels();

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

  // additional objects
  floor = createFloor();
  scene.add(floor);

  gridHelper = new THREE.GridHelper(mapSize, mapSize / gridSize, 0, 0x404040);
  gridHelper.position.set(gridSize / 2, 0.3, gridSize / 2);
  scene.add(gridHelper);

  // ghost building to help placement
  scene.add(cursor); 
  const building = buildings[currentBuildingId];
  cursorBuilding = getBuildingMesh(currentBuildingId, true);
  cursor.add(cursorBuilding);
  const geometry = new THREE.BoxGeometry(building.depth, 0.5, building.width);
  geometry.translate(building.depth / 2, 0, building.width / 2);
  placementHelper = new THREE.Mesh(geometry, markerMaterial);
  cursor.add(placementHelper);

  // render settings
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  initUI();
  window.addEventListener("resize", resizeScene);
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("keydown", onKeyPress);
  renderer.render(scene, camera);
  animate();
}

// Model Loading Helper
function loadGLTF(path) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf),
      null,
      (err) => reject(err)
    );
  });
}

// goes through buildings.js to load all of the building objects
async function loadAllModels() {
  const buildingPromises = buildings.map((b) =>
    loadGLTF(`./models/Fort/exports/${b.name}.glb`).then((gltf) => {
      const mesh = gltf.scene.getObjectByName(b.name);
      if (!mesh) {
        console.warn("No mesh named", b.name);
      }
      b.modelData = mesh ? mesh.clone() : null;
    })
  );

  await Promise.all(buildingPromises);
}

// generate a tiled texture on a plane for the floor
function createFloor() {
  const loader = new THREE.TextureLoader();
  const repeat = 4;

  function loadAndConfigureTexture(path) {
    const tex = loader.load(path);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    return tex;
  }

  const texture = loadAndConfigureTexture('./models/Floor/textures/coast_land_rocks_01_diff_1k.jpg');
  const normalMap = loadAndConfigureTexture('./models/Floor/textures/coast_land_rocks_01_nor_dx_1k.jpg');
  const roughnessMap = loadAndConfigureTexture('./models/Floor/textures/coast_land_rocks_01_rough_1k.jpg');
  const displacementMap = loadAndConfigureTexture('./models/Floor/textures/coast_land_rocks_01_disp_1k.png');


  const geometry = new THREE.PlaneGeometry(mapSize, mapSize, floorSegments, floorSegments);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(gridSize / 2, 0, gridSize / 2)
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    displacementMap: displacementMap,
    displacementScale: .5,
    roughness: 1
  });
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function animate() {
  if (floor) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(floor);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { x: gx, z: gz } = getGridCoords(point.x, point.z);
      const { x, z } = getWorldCoords(gx, gz);

      cursor.position.set(x, point.y, z);
    }

    renderer.render(scene, camera);

    controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

function onKeyPress(event) {
  if (event.key == " ") {
    const { x: gx, z: gz } = getGridCoords(
      cursor.position.x,
      cursor.position.z
    );

    var building = buildings[currentBuildingId];
    var buildingMesh = getBuildingMesh(currentBuildingId, false);
    var occupied = false;

    // calculate spaces taken up by building
    const offsets = [
      [1, building.depth + 1, 1, building.width + 1], // rot 0
      [1, building.width + 1, -building.depth + 1, 1], // rot 1
      [-building.depth + 1, 1, -building.width + 1, 1], // rot 2
      [-building.width + 1, 1, 1, building.depth + 1], // rot 3
    ];

    let [iOffStart, iOffEnd, jOffStart, jOffEnd] = offsets[rotation];
    let iStart = gx + iOffStart;
    let iEnd = gx + iOffEnd;
    let jStart = gz + jOffStart;
    let jEnd = gz + jOffEnd;

    console.log(
      `Trying to place building ${currentBuildingId} at grid origin (${gx},${gz})`
    );

    // check if the space your trying to place it on is already occupied
    for (let i = iStart; i < iEnd; i++) {
      for (let j = jStart; j < jEnd; j++) {
        const isOcc = !!grid[i][j];
        // console.log(`  Checking cell (${i},${j}): occupied? ${isOcc}`);
        if (isOcc) {
          occupied = true;
        }
      }
    }

    if (occupied) {
      console.log("  Placement aborted: space is occupied.");
    } else {
      console.log("  Space is clear. Placing building:");

      buildingMesh.position.set(
        cursor.position.x,
        cursor.position.y,
        cursor.position.z
      );

      buildingMesh.quaternion.copy(cursor.quaternion);

      // for each cell it occupies, fill that space in the array and create a red marker cube
      for (let i = iStart; i < iEnd; i++) {
        for (let j = jStart; j < jEnd; j++) {
          grid[i][j] = buildingMesh;

          const markerSize = gridSize * 1.1;
          const geometry = new THREE.BoxGeometry(markerSize, 0.5, markerSize);
          const marker = new THREE.Mesh(geometry, markerMaterial);

          // position at the center of the cell, just above ground
          const { x: wx, z: wz } = getWorldCoords(i, j);
          marker.position.set(
            wx - gridSize / 2,
            cursor.position.y + 0.05,
            wz - gridSize / 2
          );

          marker.visible = showGrid;

          scene.add(marker);
          cellMarkers.push(marker);

          // console.log(`    Marked cell (${i},${j}) occupied`);
        }
      }

      scene.add(buildingMesh);
    }
  } else if (event.key.toLowerCase() == "r") {
    rotation = (rotation + 1) % 4;
    console.log(rotation);
    cursor.rotateY(Math.PI / 2);
  }
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

var resizeScene = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
};

function getGridCoords(worldX, worldZ) {
  const x = Math.round((worldX + mapSize / 2 - gridSize / 2) / gridSize);
  const z = Math.round((worldZ + mapSize / 2 - gridSize / 2) / gridSize);
  return { x, z };
}

function getWorldCoords(gridX, gridZ) {
  const worldX = gridX * gridSize - mapSize / 2 + gridSize / 2;
  const worldZ = gridZ * gridSize - mapSize / 2 + gridSize / 2;
  return { x: worldX, z: worldZ };
}

function getBuildingMesh(buildingId, isCursor) {
  console.log("getBuildingMesh " + buildingId);
  console.log(isCursor);

  var building = buildings[buildingId].modelData.clone();
  building.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = !isCursor;
      child.receiveShadow = !isCursor;

      if (child.material) {
        child.material = child.material.clone();

        if (isCursor) {
          child.material.side = THREE.DoubleSide;
          child.material.alphaTest = 0;
          child.material.transparent = true;
          child.material.opacity = 0.5;
          child.material.needsUpdate = true;
        } else {
          child.material.side = THREE.FrontSide;
          child.material.alphaTest = 0;
          child.material.opacity = 1;
          child.material.needsUpdate = true;
        }
      }
    }
  });
  return building;
}

function initUI() {
  const buildingSelect = document.getElementById("building_selector");

  buildings.forEach((bld, idx) => {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "building_options";
    radio.id = `bld-${idx}`;
    radio.value = idx;
    if (idx === 0) radio.checked = true;

    const label = document.createElement("label");
    label.htmlFor = radio.id;
    label.textContent = bld.name;

    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        currentBuildingId = parseInt(e.target.value, 10);
        const building = buildings[currentBuildingId]

        cursor.remove(cursorBuilding);
        cursorBuilding = getBuildingMesh(currentBuildingId, true);
        cursor.add(cursorBuilding);

        cursor.remove(placementHelper);
        const geometry = new THREE.BoxGeometry(building.depth, 0.5, building.width);
        geometry.translate(building.depth / 2, 0, building.width / 2);
        placementHelper = new THREE.Mesh(geometry, markerMaterial);
        cursor.add(placementHelper);

        console.log("Selected building:", building.name);
      }
    });

    buildingSelect.appendChild(radio);
    buildingSelect.appendChild(label);
  });

  const gridToggle = document.getElementById("gridToggle");
  gridToggle.addEventListener("change", (e) => {
    showGrid = e.target.checked;
    if (gridHelper) gridHelper.visible = showGrid;
    cellMarkers.forEach((m) => (m.visible = showGrid));
  });
}

export { init };
