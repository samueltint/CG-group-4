import Road from "./Road";

class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.roadDir = null;
  }

  isFinalSize(maxBuildingSideLength, maxAspectRatio) {
    const aspect = this.w / this.h;
    const inverseAspect = this.h / this.w;

    return (
      this.w <= maxBuildingSideLength &&
      this.h <= maxBuildingSideLength &&
      aspect <= maxAspectRatio &&
      inverseAspect <= maxAspectRatio
    );
  }

  Split(minSideLength, roadWidth) {
    let blockResult, road;
    const canSplitHorizontally = this.h > minSideLength * 2;
    const canSplitVertically = this.w > minSideLength * 2;

    if (canSplitHorizontally && canSplitVertically) {
      if (this.w > this.h) {
        ({ blockResult, road } = this.splitVertically(minSideLength, roadWidth));
      } else {
        ({ blockResult, road } = this.splitHorizontally(minSideLength, roadWidth));
      }
    } else if (canSplitHorizontally) {
      ({ blockResult, road } = this.splitHorizontally(minSideLength, roadWidth));
    } else if (canSplitVertically) {
      ({ blockResult, road } = this.splitVertically(minSideLength, roadWidth));
    } else {
      blockResult = [this];
      road = null;
    }

    return { blockResult, road };
  }

  splitHorizontally(minSideLength, roadWidth) {
    const halfRoadWidth = roadWidth / 2;
    const midpoint = this.h / 2;
    const range = this.h - minSideLength * 2;
    const offset = randomRange(-range * 0.25, range * 0.25);
    const h1 = Math.floor(midpoint + offset);

    const b1 = new Block(this.x, this.y, this.w, h1 - halfRoadWidth);
    const b2 = new Block(this.x, this.y + h1 + halfRoadWidth, this.w, this.h - h1 - halfRoadWidth);

    if (b1.h < minSideLength || b2.h < minSideLength) {
      return { blockResult: [this], road: null };
    }

    const road = new Road(this.x, this.y + h1, this.x + this.w, this.y + h1, roadWidth);
    if (roadWidth > 0) {
      b1.roadDir = 0;
      b2.roadDir = 2;
    } else {
      b1.roadDir = this.roadDir
    }
    return { blockResult: [b1, b2], road };
  }

  splitVertically(minSideLength, roadWidth) {
    const halfRoadWidth = roadWidth / 2;
    const midpoint = this.w / 2;
    const range = this.w - minSideLength * 2;
    const offset = randomRange(-range * 0.25, range * 0.25);
    const w1 = Math.floor(midpoint + offset);

    const b1 = new Block(this.x, this.y, w1 - halfRoadWidth, this.h);
    const b2 = new Block(this.x + w1 + halfRoadWidth, this.y, this.w - w1 - halfRoadWidth, this.h);

    if (b1.w < minSideLength || b2.w < minSideLength) {
      return { blockResult: [this], road: null };
    }

    const road = new Road(this.x + w1, this.y, this.x + w1, this.y + this.h, roadWidth);
    if (roadWidth > 0) {
      b1.roadDir = 0;
      b2.roadDir = 2;
    } else {
      b1.roadDir = this.roadDir
    }
    return { blockResult: [b1, b2], road };
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default Block;
