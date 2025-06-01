import * as THREE from 'three';
import Block from './Block.js';
import BuildingGenerator from "./BuildingGenerator.js";
import buildings from './buildings.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// road textures
const textureLoader = new THREE.TextureLoader();
const largeRoadTexture = textureLoader.load('./textures/road/largeRoad.jpg');
const smallRoadTexture = textureLoader.load('./textures/road/smallRoad.jpg');
const asphaltTexture = textureLoader.load('./textures/road/asphalt.jpg');
[largeRoadTexture, smallRoadTexture, asphaltTexture].forEach(tex => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
});
const largeRoadMaterial = new THREE.MeshStandardMaterial({ map: largeRoadTexture, wireframe: false });
const smallRoadMaterial = new THREE.MeshStandardMaterial({ map: smallRoadTexture, wireframe: false });
const asphaltMaterial = new THREE.MeshStandardMaterial({ map: asphaltTexture, wireframe: false });

// sidewalk textures
const sidewalkColorMap = textureLoader.load('./textures/sidewalk/asphalt_diff.jpg');
const sidewalkNormalMap = textureLoader.load('./textures/sidewalk/asphalt_nor_dx.jpg');
const sidewalkRoughnessMap = textureLoader.load('./textures/sidewalk/asphalt_rough.jpg');
sidewalkColorMap.wrapS = sidewalkColorMap.wrapT = THREE.RepeatWrapping;
sidewalkNormalMap.wrapS = sidewalkNormalMap.wrapT = THREE.RepeatWrapping;
sidewalkRoughnessMap.wrapS = sidewalkRoughnessMap.wrapT = THREE.RepeatWrapping;
const sidewalkMaterial = new THREE.MeshStandardMaterial({
  map: sidewalkColorMap,
  normalMap: sidewalkNormalMap,
  roughnessMap: sidewalkRoughnessMap,
  roughness: 1.0
});

class BlockGenerator {

  blocks = [];
  roads = [];
  intersections = []
  group = new THREE.Group();

  minSideLength = 10;
  maxAspectRatio = 1.5;
  maxDepth = 30;
  minRoadWidth = 3;

  async Generate(mapSize, maxBuildingSideLength, startingRoadWidth, roadWidthDecay, skyscraperChance, skyscraperHeight) {
    this.group.clear();
    this.blocks = [];
    this.roads = [];

    
    const rootBlock = new Block(0, 0, mapSize, mapSize);
    const { blocks, roads, intersections } = this.GenerateBlocks(rootBlock, maxBuildingSideLength, startingRoadWidth, roadWidthDecay);
    this.blocks = blocks;
    this.roads = roads;
    this.intersections = intersections;
    
    await waitUntilModelsReady();

    this.PlaceObjects(mapSize, skyscraperChance, skyscraperHeight)
  }

  GenerateBlocks(initialBlock, maxBuildingSideLength, startingRoadWidth, roadWidthDecay) {
    let blocks = [initialBlock];
    let roads = [];
    let intersections = [];
    let finished = false;
    let iteration = 0;

    while (!finished && iteration <= this.maxDepth) {
      finished = true;
      const newBlocks = [];

      for (const block of blocks) {
        let blockResult, roadResult, intersectionsResult;
        let roadWidth = startingRoadWidth - roadWidthDecay * iteration;
        if (roadWidth < this.minRoadWidth) { roadWidth = 0 }

        if (!block.isFinalSize(maxBuildingSideLength, this.maxAspectRatio)) {
          ({ blockResult, roadResult, intersectionsResult } = block.Split(this.minSideLength, roadWidth));
          newBlocks.push(...blockResult);
          intersectionsResult && intersectionsResult.forEach(intersection => {
            intersection && pushUniqueIntersection(intersections, intersection);
          })

          if (roadResult) {
            roads.push(roadResult);
          }
          finished = false;
        } else {
          newBlocks.push(block);
        }

      }
      // console.log("blocks: ", blocks)
      // console.log("roads: ", roads)
      blocks = newBlocks;
      iteration++;
    }

    return { blocks, roads, intersections };
  }

  PlaceObjects(mapSize, skyscraperChance, skyscraperHeight) {
    // create buildings and sidewalks
    this.blocks.forEach((block) => {
      // sidewalks
      const geometry = new THREE.BoxGeometry(block.w, .3, block.h);
      const material = sidewalkMaterial.clone();
      material.map = sidewalkColorMap.clone();
      material.normalMap = sidewalkNormalMap.clone();
      material.roughnessMap = sidewalkRoughnessMap.clone();

      const tileDensity = 2;
      material.map.repeat.set(block.w / tileDensity, block.h / tileDensity);
      material.normalMap.repeat.set(block.w / tileDensity, block.h / tileDensity);
      material.roughnessMap.repeat.set(block.w / tileDensity, block.h / tileDensity);
      const blockObj = new THREE.Mesh(geometry, material);

      const xCoord = block.x + block.w / 2 - mapSize / 2;
      const zCoord = block.y + block.h / 2 - mapSize / 2;
      blockObj.position.set(xCoord, 0, zCoord);
      blockObj.castShadow = true;
      blockObj.receiveShadow = true;
      this.group.add(blockObj);

      //buildings
      const loaded = LoadBuilding(block.w, block.h, xCoord, zCoord, block.roadDir);
      let building, effectiveWidth, effectiveDepth;

      if (!loaded || Math.random() <= skyscraperChance) {
        building = BuildingGenerator(block.w, block.h, xCoord, zCoord, skyscraperHeight);
      } else {
        ({ building, effectiveWidth, effectiveDepth } = loaded);
        moveBuilding(block, building, mapSize, effectiveWidth, effectiveDepth);
      }

      this.group.add(building);
    });

    //create roads
    this.roads.forEach((road) => {
      const width = road.width;

      if (width > 0) {
        const x1 = road.x1 - mapSize / 2;
        const y1 = road.y1 - mapSize / 2;
        const x2 = road.x2 - mapSize / 2;
        const y2 = road.y2 - mapSize / 2;

        const isHorizontal = y1 === y2;
        const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);

        let geometry;
        var material;
        if (width <= 4) {
          material = asphaltMaterial.clone();
          material.map = asphaltMaterial.map.clone();
        } else if (width <= 8) {
          material = smallRoadMaterial.clone();
          material.map = smallRoadMaterial.map.clone();
        } else {
          material = largeRoadMaterial.clone();
          material.map = largeRoadMaterial.map.clone();
        }

        material.map.center.set(0.5, 0.5);

        if (isHorizontal) {
          geometry = new THREE.BoxGeometry(length, 0.1, width);
        } else {
          geometry = new THREE.BoxGeometry(width, 0.1, length);
          material.map.rotation = Math.PI / 2;
        }

        material.map.repeat.set(length / width, 1);
        material.map.needsUpdate = true;

        const roadObj = new THREE.Mesh(geometry, material);
        roadObj.receiveShadow = true;
        const center = road.getCenter();
        roadObj.position.set(center.x - mapSize / 2, 0.0, center.y - mapSize / 2);
        this.group.add(roadObj);
      }

    });

    // //intersection helpers
    // this.intersections && this.intersections.forEach((intersection) => {
    //   const axisHelper = new THREE.AxesHelper(2); // Size 2 units
    //   axisHelper.position.set(intersection.x - mapSize / 2, 0.5, intersection.y - mapSize / 2);
    //   this.group.add(axisHelper);
    // });
  }

  getGroup() {
    return this.group;
  }
}

// ensures models are loaded before attempting to build, encountered a repeating bug where objects wouldnt load because it was called before the models were loaded  
async function waitUntilModelsReady() {
  return new Promise((resolve) => {
    const check = async () => {
      console.log("check")
      if (buildings[0].modelData !== null) {
        resolve();
      } else {
        const buildingGltf = await loadGLTF('./models/Buildings/buildings.glb');
        for (const b of buildings) {
          const mesh = buildingGltf.scene.getObjectByName(b.name);
          if (!mesh) {
            console.warn("No mesh named", b.name);
            b.modelData = null;
          } else {
            b.modelData = mesh.clone();
          }
        }
        setTimeout(check, 100);
      }
    };
    check();
  });
}

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

function LoadBuilding(blockW, blockH, x, z, roadDir) {
  for (const b of buildings) {
    console.log(`load ${b.modelData}`)
    if (!b.modelData || Math.random < .1) continue;

    const temp = b.modelData.clone();

    const bbox = new THREE.Box3().setFromObject(temp);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const isRotated = roadDir % 2 === 1;
    const effectiveWidth = isRotated ? size.z : size.x;
    const effectiveDepth = isRotated ? size.x : size.z;

    if (blockW >= effectiveWidth && blockH >= effectiveDepth) {
      const building = temp;

      if (roadDir !== null && roadDir !== undefined) {
        building.rotateY(roadDir * Math.PI / 2);
      }

      building.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      return { building, effectiveWidth, effectiveDepth };
    }
  }
  return null;
}

function moveBuilding(block, building, mapSize, effectiveWidth, effectiveDepth) {
  let xCoord = block.x + block.w / 2 - mapSize / 2;
  let zCoord = block.y + block.h / 2 - mapSize / 2;

  switch (block.roadDir) {
    case 0:
      zCoord = block.y - mapSize / 2 + effectiveDepth / 2;
      break;
    case 1:
      xCoord = block.x + block.w - mapSize / 2 - effectiveWidth / 2;
      break;
    case 2:
      xCoord = block.x - mapSize / 2 + effectiveWidth / 2;
      break;
    case 3:
      zCoord = block.y + block.h - mapSize / 2 - effectiveDepth / 2;
      break;
  }

  building.position.set(xCoord, 0, zCoord);
}

function pushUniqueIntersection(intersections, newIntersection) {
  const threshold = 0.01;
  const existing = intersections.find(existing => {
    const dx = Math.abs(existing.x - newIntersection.x);
    const dy = Math.abs(existing.y - newIntersection.y);
    return dx < threshold && dy < threshold;
  });

  if (existing) {
    newIntersection.roads.forEach(road => {
      if (!existing.roads.includes(road)) {
        existing.roads.push(road);
      }
    });
  } else {
    intersections.push(newIntersection);
  }
}


export default BlockGenerator;