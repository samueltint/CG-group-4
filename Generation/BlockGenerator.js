import * as THREE from 'three';
import Block from './Block.js';
import BuildingGenerator from "./BuildingGenerator.js";
import buildings from './Buildings.js';
import { randInt } from 'three/src/math/MathUtils.js';

const textureLoader = new THREE.TextureLoader();
 const roadTexture = textureLoader.load('./textures/roadimg.jpg');
 const roadTexture2 = textureLoader.load('./textures/roadimg2.jpg');
 roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
 roadTexture2.wrapS = roadTexture2.wrapT = THREE.RepeatWrapping;

class BlockGenerator {

  blocks = [];
  roads = [];
  group = new THREE.Group();s

  minSideLength = 10;
  maxAspectRatio = 1.5;
  maxDepth = 50;
  minRoadWidth = 1;

  Generate(mapSize, maxBuildingSideLength, startingRoadWidth, roadWidthDecay, skyscraperChance, skyscraperHeight) {
    this.group.clear();
    this.blocks = [];
    this.roads = [];

    const rootBlock = new Block(0, 0, mapSize, mapSize);
    const { blocks, roads } = this.GenerateBlocks(rootBlock, maxBuildingSideLength, startingRoadWidth, roadWidthDecay);
    this.blocks = blocks;
    this.roads = roads;
    this.PlaceObjects(mapSize, skyscraperChance, skyscraperHeight)
  }

  GenerateBlocks(initialBlock, maxBuildingSideLength, startingRoadWidth, roadWidthDecay) {
    let blocks = [initialBlock];
    let roads = [];
    let finished = false;
    let iteration = 0;

    while (!finished && iteration <= this.maxDepth) {
      finished = true;
      const newBlocks = [];

      for (const block of blocks) {
        let blockResult, road;
        let roadWidth = startingRoadWidth - roadWidthDecay * iteration;
        if (roadWidth < this.minRoadWidth) { roadWidth = 0 }

        if (!block.isFinalSize(maxBuildingSideLength, this.maxAspectRatio)) {
          ({ blockResult, road } = block.Split(this.minSideLength, roadWidth));
          newBlocks.push(...blockResult);
          if (road) {
            roads.push(road);
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

    return { blocks, roads };
  }



  PlaceObjects(mapSize, skyscraperChance, skyscraperHeight) {
    this.blocks.forEach((block) => {
      const geometry = new THREE.BoxGeometry(block.w, 1, block.h);
      const material = new THREE.MeshPhongMaterial({ color: 0x4A4545 });
      const blockObj = new THREE.Mesh(geometry, material);

      const xCoord = block.x + block.w / 2 - mapSize / 2;
      const zCoord = block.y + block.h / 2 - mapSize / 2;
      blockObj.position.set(xCoord, 0, zCoord);
      blockObj.castShadow = true;
      blockObj.receiveShadow = true;
      this.group.add(blockObj);

      const loaded = LoadBuilding(block.w, block.h, xCoord, zCoord, block.roadDir);
      let building, effectiveWidth, effectiveDepth;

      if (!loaded || Math.random() <= skyscraperChance) {
        building = BuildingGenerator(block.w, block.h, xCoord, zCoord, skyscraperHeight);
        // If BuildingGenerator returns just building mesh, you might need bounding box for it too
      } else {
        ({ building, effectiveWidth, effectiveDepth } = loaded);
        // Now position building at the road side:
        moveBuilding(block, building, mapSize, effectiveWidth, effectiveDepth);
      }

      this.group.add(building);
    });

    this.roads.forEach((road) => {
      const width = road.width;

      const x1 = road.x1 - mapSize / 2;
      const y1 = road.y1 - mapSize / 2;
      const x2 = road.x2 - mapSize / 2;
      const y2 = road.y2 - mapSize / 2;

      const isHorizontal = y1 === y2;
      const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);

      // BoxGeometry: width (X), height (Y), depth (Z)
      const geometry = isHorizontal
        ? new THREE.BoxGeometry(length, 0.5, width)
        : new THREE.BoxGeometry(width, 0.5, length);

      roadTexture.repeat.set(y2/4, 1);
      const material = new THREE.MeshPhongMaterial({ map: roadTexture2 });
      const roadObj = new THREE.Mesh(geometry, material);
      roadObj.receiveShadow = true;
      roadObj.position.set((x1 + x2) / 2, 0.05, (y1 + y2) / 2);
      if(isHorizontal){
        roadTexture2.repeat.set(1, y1/4);
        roadObj.material.map = roadTexture;
      }
      this.group.add(roadObj);
    });

  }


  getGroup() {
    return this.group;
  }
}

function LoadBuilding(blockW, blockH, x, z, roadDir) {
  for (const b of buildings) {
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
      zCoord = block.y + block.h - mapSize / 2 - effectiveDepth / 2;
      break;
    case 3:
      xCoord = block.x - mapSize / 2 + effectiveWidth / 2;
      break;
  }

  building.position.set(xCoord, 0, zCoord);
}

export default BlockGenerator;