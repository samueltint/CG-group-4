import Road from "./Road";

class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  isFinalSize(minSideLength, maxSideLength, maxAspectRatio) {
    const aspect = this.w / this.h;
    const inverseAspect = this.h / this.w;

    return (
      this.w >= minSideLength &&
      this.h >= minSideLength &&

      this.w <= maxSideLength &&
      this.h <= maxSideLength &&

      aspect <= maxAspectRatio &&
      inverseAspect <= maxAspectRatio
    );
  }

  Split(minSideLength) {
    let blockResult, road;
    const canSplitHorizontally = this.h > minSideLength * 2;
    const canSplitVertically = this.w > minSideLength * 2;

    if (canSplitHorizontally && canSplitVertically) {
      if (this.w > this.h) {
        ({ blockResult, road } = this.splitVertically(minSideLength));
      } else {
        ({ blockResult, road } = this.splitHorizontally(minSideLength));
      }
    } else if (canSplitHorizontally) {
      ({ blockResult, road } = this.splitHorizontally(minSideLength));
    } else if (canSplitVertically) {
      ({ blockResult, road } = this.splitVertically(minSideLength));
    } else {
      blockResult = [this];
      road = undefined;
    }

    return { blockResult, road };
  }

  splitHorizontally(minSideLength) {
    const midpoint = this.h / 2;
    const range = this.h - minSideLength * 2;
    const offset = randomRange(-range * 0.25, range * 0.25);
    const h1 = Math.floor(midpoint + offset);

    const b1 = new Block(this.x, this.y, this.w, h1);
    const b2 = new Block(this.x, this.y + h1, this.w, this.h - h1);

    const blockResult = (b1 && b2) ? [b1, b2] : [this];
    const road = new Road(this.x, this.y + h1, this.x + this.w, this.y + h1);

    return { blockResult, road };
  }

  splitVertically(minSideLength) {
    const midpoint = this.w / 2;
    const range = this.w - minSideLength * 2;
    const offset = randomRange(-range * 0.25, range * 0.25);
    const w1 = Math.floor(midpoint + offset);

    const b1 = new Block(this.x, this.y, w1, this.h);
    const b2 = new Block(this.x + w1, this.y, this.w - w1, this.h);

    const blockResult = b1 && b2 ? [b1, b2] : [this];
    const road = new Road(this.x + w1, this.y, this.x + w1, this.y + this.h);

    return { blockResult, road };
  }



}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default Block