import * as THREE from 'three';
import Block from './Block';
import BuildingGenerator from "../BuildingGenerator.js";

class BlockGenerator {

  blocks = [];
  roads = [];
  helpers = new THREE.Object3D();

  minSideLength = 5;
  maxSideLength = 10;
  maxAspectRatio = 2;
  maxDepth = 100;
  startRoadWidth = 8;
  minRoadWidth = 0;

  VisualiseSequence(mapSize) {
    const rootBlock = new Block(0, 0, mapSize, mapSize);
    const { blocks, roads } = this.GenerateBlocks(rootBlock);
    this.blocks = blocks;
    this.roads = roads;
    this.PlaceHelpers(mapSize)
    this.PlaceRoadHelpers(mapSize)
  }

  GenerateBlocks(initialBlock) {
    let blocks = [initialBlock];
    let roads = [];
    let finished = false;
    let iteration = 0;

    while (!finished && iteration <= this.maxDepth) {
      finished = true;
      const newBlocks = [];

      for (const block of blocks) {
        let blockResult, road;
        let roadWidth = Math.max(this.startRoadWidth - iteration, this.minRoadWidth);

        if (!block.isFinalSize(this.minSideLength, this.maxSideLength, this.maxAspectRatio)) {
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
      //       console.log("blocks: ", blocks)
      // console.log("roads: ", roads)
      blocks = newBlocks;
      iteration++;
    }

    return { blocks, roads };
  }

  PlaceHelpers(mapSize) {
    this.blocks.forEach((block) => {
      const geometry = new THREE.BoxGeometry(block.w, 0.7, block.h);
      const material = new THREE.MeshPhongMaterial({
        color: 0x4A4545,
      });
      const blockObj = new THREE.Mesh(geometry, material);

      var xCoord = block.x + block.w / 2 - mapSize / 2;
      var zCoord = block.y + block.h / 2 - mapSize / 2;
      blockObj.position.set(
        xCoord,
        0,
        zCoord
      );
      blockObj.receiveShadow = true;
      this.helpers.add(blockObj);

      var building = BuildingGenerator(block.w, block.h, xCoord, zCoord)
      this.helpers.add(building);
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

      const material = new THREE.MeshPhongMaterial({ color: 0x2E2B2B });
      const roadObj = new THREE.Mesh(geometry, material);
      roadObj.receiveShadow = true;
      roadObj.position.set((x1 + x2) / 2, 0.05, (y1 + y2) / 2);
      this.helpers.add(roadObj);
    });
    const axes = new THREE.AxesHelper(5);
    axes.translateY(1.5);
    this.helpers.add(axes);
  }

  PlaceRoadHelpers(mapSize) {

  }


  getHelpers() { return this.helpers }
}

export default BlockGenerator;