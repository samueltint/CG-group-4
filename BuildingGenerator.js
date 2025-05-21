//customisable parameters
import * as THREE from "three";

// load textures
const textureLoader = new THREE.TextureLoader();
const buildingTexture = textureLoader.load('./textures/images.jpg');
buildingTexture.wrapS = buildingTexture.wrapT = THREE.RepeatWrapping;
buildingTexture.repeat.set(1, 1);
const buildingGap = 1;


function getRandomColor() {
    const baseColors = [
        new THREE.Color(0x666666), // darker gray
        new THREE.Color(0x555555), // even darker gray
        new THREE.Color(0x777777), // medium dark gray
        new THREE.Color(0x8b7d6b), // dark beige/tan
        new THREE.Color(0x5a708a), // darker steel blue
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

var minHeight = 10;
var maxHeight = 30;
var building; // array of buildings

function BuildingGenerator(blockW, blockD, xCoord, zCoord) {
  const BuildingH = (Math.pow(Math.random(), 3)) * (maxHeight - minHeight) + minHeight;
 
  building = createCube(blockW, BuildingH, blockD);
  building.position.set(xCoord, BuildingH / 2, zCoord);
  return building;
}


export default BuildingGenerator;
