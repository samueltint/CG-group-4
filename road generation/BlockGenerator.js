import * as THREE from 'three';
import Block from './Block';

class BlockGenerator {

  blocks = [];
  roads = [];
  helpers = new THREE.Object3D();

  minSideLength = 5;
  maxSideLength = 10;
  maxAspectRatio = 2;
  maxDepth = 3;
  startRoadWidth = 6;
  minRoadWidth = 2;

  VisualiseSequence(mapSize) {
    const rootBlock = new Block(0, 0, mapSize, mapSize);
    const { blocks, roads } = this.GenerateBlocks(rootBlock);
    this.blocks = blocks;
    this.roads = roads;
    this.PlaceBlockHelpers(mapSize)
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
        if (block.isFinalSize(this.minSideLength, this.maxSideLength, this.maxAspectRatio)) {
          console.log("block finished\n x: %f, y: %f, w: %f, h: %f, ratio: %f", this.x, this.y, this.w, this.h, Math.max(this.w / this.h, this.h / this.w))
        } else {
          let roadWidth = Math.max(this.startRoadWidth - 2 * iteration, this.minRoadWidth);
          ({ blockResult, road } = block.Split(this.minSideLength, roadWidth));
          newBlocks.push(...blockResult);
          if (road) {
            roads.push(road);
          }
          finished = false;
        }

      }

      blocks = newBlocks;
      console.log("blocks: ", blocks)
      console.log("roads: ", roads)
      iteration++;
    }

    return { blocks, roads };
  }

  PlaceBlockHelpers(mapSize) {
    this.blocks.forEach((block) => {
      const geometry = new THREE.BoxGeometry(block.w, 0, block.h);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        wireframe: true
      });
      const blockObj = new THREE.Mesh(geometry, material);

      blockObj.position.set(
        block.x + block.w / 2 - mapSize / 2 + .5,
        0.5,
        block.y + block.h / 2 - mapSize / 2 + .5
      );

      this.helpers.add(blockObj)
    })
  }

  PlaceRoadHelpers(mapSize) {
    this.roads.forEach((road) => {
      const width = road.width;

      const x1 = road.x1 - mapSize / 2 + 0.5;
      const y1 = road.y1 - mapSize / 2 + 0.5;
      const x2 = road.x2 - mapSize / 2 + 0.5;
      const y2 = road.y2 - mapSize / 2 + 0.5;
  
      const isHorizontal = y1 === y2;
      const length = isHorizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
  
      // BoxGeometry: width (X), height (Y), depth (Z)
      const geometry = isHorizontal
        ? new THREE.BoxGeometry(length, 0.1, width)
        : new THREE.BoxGeometry(width, 0.1, length);
  
      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const roadObj = new THREE.Mesh(geometry, material);
  
      roadObj.position.set((x1 + x2) / 2, 0.05, (y1 + y2) / 2);
      this.helpers.add(roadObj);
    });
  }
  

  getHelpers() { return this.helpers }
}

export default BlockGenerator;