//customisable parameters
import * as THREE from "three";

// load textures
const textureLoader = new THREE.TextureLoader();
const buildingTexture = textureLoader.load('./textures/image.jpg');
buildingTexture.wrapS = buildingTexture.wrapT = THREE.RepeatWrapping;
buildingTexture.repeat.set(0.8, 0.1);
const buildingGap = 1;

function getRandomColor() {
    const baseColors = [
        new THREE.Color(0x687b8e), // main cool gray-blue
        new THREE.Color(0x596973), // darker muted blue-gray
        new THREE.Color(0x7a8c9f), // lighter steel blue
        new THREE.Color(0x8f9ba8), // pale blue-gray
        new THREE.Color(0x566570), // deep gray-blue
    ];
    const base = baseColors[Math.floor(Math.random() * baseColors.length)];
    const variation = 0.05;

    return new THREE.Color(
        Math.min(1, Math.max(0, base.r + (Math.random() - 0.5) * variation)),
        Math.min(1, Math.max(0, base.g + (Math.random() - 0.5) * variation)),
        Math.min(1, Math.max(0, base.b + (Math.random() - 0.5) * variation))
    );
}

function createCube(w, h, d, color) {
  const randomColor = getRandomColor();
  const texturedMaterial = new THREE.MeshPhongMaterial({
    map: buildingTexture,
    color: randomColor,
    wireframe: false,
  });

  const plainMaterial = new THREE.MeshPhongMaterial({
    color: randomColor,
    wireframe: false,
  });

  // textures per building face
  const materials = [
    texturedMaterial, // right
    texturedMaterial, // left
    plainMaterial,    // top (no texture)
    plainMaterial,    // bottom (no texture)
    texturedMaterial, // front
    texturedMaterial, // back
  ];

  const geometry = new THREE.BoxGeometry(w - buildingGap, h, d - buildingGap);

  // stop texture from strechiung too much
  const repeatY = h / 2; // change texture scale
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const y = uvs.getY(i);
    uvs.setY(i, y * repeatY);
  }
  uvs.needsUpdate = true;

  const cube = new THREE.Mesh(geometry, materials);
  cube.castShadow = true;
  cube.receiveShadow = true;

  return cube;
}

var minHeight = 15;
var maxHeight = 50;
var building; // array of buildings

function BuildingGenerator(blockW, blockD, xCoord, zCoord) {
  const BuildingH = (Math.pow(Math.random(), 2)) * (maxHeight - minHeight) + minHeight;

  building = createCube(blockW, BuildingH, blockD);
  building.position.set(xCoord, BuildingH / 2, zCoord);
  return building;
}


export default BuildingGenerator;
