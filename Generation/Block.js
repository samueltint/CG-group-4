import Intersection from "./Intersection";
import Road from "./Road";

class Block {
  constructor(x, y, w, h, posXRoad, negXRoad, posYRoad, negYRoad) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.roadDir = null;

    this.posXRoad = posXRoad;
    this.negXRoad = negXRoad;
    this.posYRoad = posYRoad;
    this.negYRoad = negYRoad;
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
    let blockResult, road, intersections;
    const canSplitHorizontally = this.h > minSideLength * 2;
    const canSplitVertically = this.w > minSideLength * 2;

    if (canSplitHorizontally && canSplitVertically) {
      if (this.w > this.h) {
        ({ blockResult, road, intersections } = this.split(false, minSideLength, roadWidth));
      } else {
        ({ blockResult, road, intersections } = this.split(true, minSideLength, roadWidth));
      }
    } else if (canSplitHorizontally) {
      ({ blockResult, road, intersections } = this.split(true, minSideLength, roadWidth));
    } else if (canSplitVertically) {
      ({ blockResult, road, intersections } = this.split(false, minSideLength, roadWidth));
    } else {
      blockResult = [this];
      road = null;
      intersections = null;
    }

    return { blockResult, roadResult: road, intersectionsResult: intersections };
  }

  split(isHorizontal, minSideLength, roadWidth) {
    const halfRoadWidth = roadWidth / 2;

    const totalLength = isHorizontal ? this.h : this.w;
    const midpoint = totalLength / 2;
    const range = totalLength - minSideLength * 2;
    const offset = randomRange(-range * 0.25, range * 0.25);
    const splitPos = Math.floor(midpoint + offset);

    let b1, b2, road;
    let intersections = []

    if (isHorizontal) {
      road = new Road(this.x, this.y + splitPos, this.x + this.w, this.y + splitPos, roadWidth);
      b1 = new Block(
        this.x,
        this.y,
        this.w,
        splitPos - halfRoadWidth,
        this.posXRoad,
        this.negXRoad,
        road,
        this.negYRoad
      );

      b2 = new Block(
        this.x,
        this.y + splitPos + halfRoadWidth,
        this.w,
        this.h - splitPos - halfRoadWidth,
        this.posXRoad,
        this.negXRoad,
        this.posYRoad,
        road
      );

      this.negXRoad && intersections.push(new Intersection(this.x - this.negXRoad.width / 2, this.y + splitPos, [road, this.negXRoad]));
      this.posXRoad && intersections.push(new Intersection(this.x + this.w + this.posXRoad.width / 2, this.y + splitPos, [road, this.posXRoad]));
    } else {
      road = new Road(this.x + splitPos, this.y, this.x + splitPos, this.y + this.h, roadWidth);
      b1 = new Block(
        this.x,
        this.y,
        splitPos - halfRoadWidth,
        this.h,
        road,
        this.negXRoad,
        this.posYRoad,
        this.negYRoad
      );

      b2 = new Block(
        this.x + splitPos + halfRoadWidth,
        this.y,
        this.w - splitPos - halfRoadWidth,
        this.h,
        this.posXRoad,
        road,
        this.posYRoad,
        this.negYRoad
      );

      this.negYRoad && intersections.push(new Intersection(this.x + splitPos, this.y - this.negYRoad.width / 2, [road, this.negYRoad]));
      this.posYRoad && intersections.push(new Intersection(this.x + splitPos, this.y + this.h + this.posYRoad.width / 2, [road, this.posYRoad]));
    }

    const tooSmall = isHorizontal ? (b1.h < minSideLength || b2.h < minSideLength)
      : (b1.w < minSideLength || b2.w < minSideLength);

    if (tooSmall) {
      return { blockResult: [this], road: null, intersections: null };
    }

    [b1, b2].forEach(block => {
      const roads = [
        { dir: 0, road: block.negYRoad },
        { dir: 1, road: block.posXRoad },
        { dir: 2, road: block.negXRoad },
        { dir: 3, road: block.posYRoad },
      ];

      let maxRoad = roads.reduce((max, curr) => {
        if (curr.road && curr.road.width > (max.road?.width ?? -Infinity)) return curr;
        return max;
      }, { dir: null, road: null });

      block.roadDir = maxRoad.dir !== null ? maxRoad.dir : this.roadDir;
    });

    return { blockResult: [b1, b2], road, intersections };
  }

}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default Block;
