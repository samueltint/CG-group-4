class Intersection {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.roads = [];
  }

  addRoad(road) {
    if (!this.roads.includes(road)) {
      this.roads.push(road);
    }
  }
}

export default Intersection;