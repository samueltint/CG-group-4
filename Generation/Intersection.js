class Intersection {
  constructor(x, y, roads) {
    this.x = x;
    this.y = y;
    this.roads = roads;
  }

  addRoad(road) {
    if (!this.roads.includes(road)) {
      this.roads.push(road);
    }
  }
}

export default Intersection;