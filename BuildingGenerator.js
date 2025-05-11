//customisable paramaters
import * as THREE from "three";

function createCube(w, h, d, color) {
  var material = new THREE.MeshPhongMaterial();
  material.color = new THREE.Color(color);
  material.wireframe = false;
  var geometry = new THREE.BoxGeometry(w, h, d);
  var cube = new THREE.Mesh(geometry, material);
  return cube;
}

var MHeight = 20; // height of towers
var cubes = []; // array of buildings
const group = new THREE.Group();

function BuildingGenerator(blockW, blockD, xCoord, zCoord) {

  var border = 2;
  var xTowers = Math.ceil(blockW / 3);
  var zTowers = Math.ceil(blockD / 3);
  var Xpos = xCoord-blockW/2+border;
  var Zpos = zCoord-blockD/2+border;

  for (let i = 0; i < zTowers; i++) {
    for(let j = 0; j < xTowers; j++) {
        var BuildingH = Math.random() * (MHeight - 10) + 10; // formula for using Math.random between 2 numbers
        var BuildingD = Math.random() * 3 +1;
        var BuildingW = Math.random() * 2 +1;

        if(Xpos + BuildingW/2 > xCoord + blockW/2 - border){
            break;
        }

        cubes[i] = createCube(BuildingW, BuildingH, BuildingD, 0x4d4d4d);
        cubes[i].position.x = Xpos +BuildingW/2; ;
        cubes[i].position.y = -(MHeight / 2) + BuildingH / 2;
        cubes[i].position.z = Zpos +BuildingD/2; ;

        group.add(cubes[i]);
        Xpos += BuildingW + border;
        }
        Xpos = xCoord-blockW/2+border;
        Zpos += 2;
    }
  group.position.y = MHeight / 2;
  group.position.z=- 2;
  return group; 

}
export default BuildingGenerator;