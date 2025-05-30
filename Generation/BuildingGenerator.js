//customisable parameters
import * as THREE from "three";

// load textures
const textureLoader = new THREE.TextureLoader();

const facadeVariants = [1, 5, 6].map(num => {
  const pad = num.toString().padStart(2, '0');
  const variant = {
    map: textureLoader.load(`./textures/Facades_${pad}_basecolor.jpg`),
    aoMap: textureLoader.load(`./textures/Facades_${pad}_ambientocclusion.jpg`),
    normalMap: textureLoader.load(`./textures/Facades_${pad}_normal.jpg`),
    roughnessMap: textureLoader.load(`./textures/Facades_${pad}_roughness.jpg`),
    metalnessMap: textureLoader.load(`./textures/Facades_${pad}_metallic.jpg`),
  };

  Object.values(variant).forEach((map) => {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 6);
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
  });

  return variant;
});

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
  const variant = facadeVariants[Math.floor(Math.random() * facadeVariants.length)];

  const pbrMaterial = new THREE.MeshStandardMaterial({
    map: variant.map,
    aoMap: variant.aoMap,
    metalnessMap: variant.metalnessMap,
    roughnessMap: variant.roughnessMap,
    normalMap: variant.normalMap,
    color: randomColor,
  });

  const plainMaterial = new THREE.MeshStandardMaterial({
    color: randomColor,
  });

  // textures per building face
  const materials = [
    pbrMaterial, // right
    pbrMaterial, // left
    plainMaterial,    // top (no texture)
    plainMaterial,    // bottom (no texture)
    pbrMaterial, // front
    pbrMaterial, // back
  ];

  const geometry = new THREE.BoxGeometry(w - buildingGap, h, d - buildingGap);
  geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
  // stop texture from strechiung too much
  const repeatY = h / 12; // change texture scale
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
var building;

function BuildingGenerator(blockW, blockD, xCoord, zCoord, maxHeight) {
  const BuildingH = (Math.pow(Math.random(), 2)) * (maxHeight - minHeight) + minHeight;

  building = createCube(blockW, BuildingH, blockD);
  building.position.set(xCoord, BuildingH / 2, zCoord);
  return building;
}


export default BuildingGenerator;
