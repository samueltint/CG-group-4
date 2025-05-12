//customisable parameters
import * as THREE from "three";

// load textures
const textureLoader = new THREE.TextureLoader();
const buildingTexture = textureLoader.load('./textures/images.jpg');
buildingTexture.wrapS = buildingTexture.wrapT = THREE.RepeatWrapping;
buildingTexture.repeat.set(1, 1);


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

  const geometry = new THREE.BoxGeometry(w, h, d);

  // stop texture from strechiung too much
  const repeatY = h / 2; // change texture scale
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) {
    const y = uvs.getY(i);
    uvs.setY(i, y * repeatY);
  }
  uvs.needsUpdate = true;

  const cube = new THREE.Mesh(geometry, materials);
  return cube;
}


var MHeight = 20; // height of towers
var cubes = []; // array of buildings
const group = new THREE.Group();

function BuildingGenerator(blockW, blockD, xCoord, zCoord) {
  const border = 2;
  const xTowers = Math.ceil(blockW / 3);
  const zTowers = Math.ceil(blockD / 3);
  let Xpos = xCoord - blockW / 2 + border;
  let Zpos = zCoord - blockD / 2 + border;

  for (let i = 0; i < zTowers; i++) {
    for (let j = 0; j < xTowers; j++) {
      const BuildingH = Math.random() * (MHeight - 10) + 10;
      const BuildingD = Math.random() * 3 + 1;
      const BuildingW = Math.random() * 2 + 1;

      if (Xpos + BuildingW / 2 > xCoord + blockW / 2 - border) {
        break;
      }

      cubes[i] = createCube(BuildingW, BuildingH, BuildingD, 0x4d4d4d);
      cubes[i].position.set(
        Xpos + BuildingW / 2,
        -(MHeight / 2) + BuildingH / 2,
        Zpos + BuildingD / 2
      );

      group.add(cubes[i]);
      Xpos += BuildingW + border;
    }
    Xpos = xCoord - blockW / 2 + border;
    Zpos += 2;
  }

  group.position.y = MHeight / 2;
  group.position.z = -2;

  return group;
}

export default BuildingGenerator;
