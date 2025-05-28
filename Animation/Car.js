import * as THREE from 'three';

class Car extends THREE.Object3D {
  constructor(model, currentIntersection, mapSize) {
    super();

    this.currentIntersection = currentIntersection;
    this.lastRoad = null;
    this.nextIntersection = null;
    this.speed = 10;
    this.mapSize = mapSize;

    this.add(model);
    this.selectNextIntersection();
  }

  selectNextIntersection() {
    if (this.nextIntersection) {
      this.currentIntersection = this.nextIntersection;
    }

    const roads = this.currentIntersection.roads;
    if (!roads || roads.length === 0) return;

    const wideRoads = roads.filter(road => road.width > 4);

    const preferredRoads = wideRoads.filter(road => road !== this.lastRoad);
    let candidateRoads = preferredRoads.length > 0 ? preferredRoads : wideRoads;

    if (candidateRoads.length === 0) return;

    const randomRoad = candidateRoads[Math.floor(Math.random() * candidateRoads.length)];

    const possibleIntersections = randomRoad.intersections.filter(
      intersection => intersection !== this.currentIntersection
    );

    if (possibleIntersections.length === 0) return;

    this.nextIntersection = possibleIntersections[Math.floor(Math.random() * possibleIntersections.length)];
    this.lastRoad = randomRoad; 
  }
}

export default Car;
