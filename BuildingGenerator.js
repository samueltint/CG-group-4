//customisable parameters
import * as THREE from "three";

// load textures
const textureLoader = new THREE.TextureLoader();
const buildingTexture = textureLoader.load('./textures/images.jpg');
buildingTexture.wrapS = buildingTexture.wrapT = THREE.RepeatWrapping;
buildingTexture.repeat.set(1, 1);
const buildingGap = 1;


function createCube(w, h, d, color) {
  const texturedMaterial = new THREE.MeshPhongMaterial({
    map: buildingTexture,
    color: new THREE.Color(color),
    wireframe: false,
  });

  const plainMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
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


var MHeight = 20; // height of towers
var building; // array of buildings

function BuildingGenerator(blockW, blockD, xCoord, zCoord) {
  const BuildingH = Math.random() * (MHeight - 10) + 10;
  building = createCube(blockW, BuildingH, blockD, 0x4d4d4d);
  building.position.set(xCoord, BuildingH / 2, zCoord);
  return building;
}

export default BuildingGenerator;
