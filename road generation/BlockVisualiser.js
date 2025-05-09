import * as THREE from 'three';
import Block from './Block';

class BlockVisualiser {

  blocks = [];
  helpers = new THREE.Object3D();
  minSideLength = 5;
  maxSideLength = 10;
  maxAspectRatio = 2;
  maxDepth = 3;

  VisualiseSequence(mapSize) {

    const rootBlock = new Block(0, 0, mapSize, mapSize);
    this.blocks = this.GenerateBlocks(rootBlock, 5);
    this.PlaceRoadHelpers(mapSize)
  }

  GenerateBlocks(initialBlock) {
    let blocks = [initialBlock];
    let finished = false;
    let iteration = 0;

    while (!finished && iteration <= this.maxDepth) {
      finished = true;
      const newBlocks = [];

      for (const block of blocks) {

        if (block.isFinalSize(this.minSideLength, this.maxSideLength, this.maxAspectRatio)) {
          console.log("block finished\n x: %f, y: %f, w: %f, h: %f, ratio: %f", this.x, this.y, this.w, this.h, Math.max(this.w / this.h, this.h / this.w))
        } else {
          newBlocks.push(...block.Split(this.minSideLength));
          finished = false;
        }

      }

      blocks = newBlocks;
      console.log(blocks)
      iteration++;
    }

    return blocks;
  }

  PlaceRoadHelpers(mapSize) {
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

  getArrows() { return this.helpers }
}

export default BlockVisualiser;