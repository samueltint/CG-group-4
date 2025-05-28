class Road {

  constructor(x1, y1, x2, y2, width) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
    this.intersections = []

  }

  getCenter() {
    return {
      x: (this.x1 + this.x2) / 2,
      y: (this.y1 + this.y2) / 2
    };
  }
}

export default Road