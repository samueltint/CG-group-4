import * as THREE from 'three';
import cars from './Cars';
import Car from './Car';

class CarAnimator {
  constructor(scene, intersections, mapSize, carCount) {
    this.scene = scene;
    this.intersections = intersections;
    this.activeCars = [];
    this.clock = new THREE.Clock();
    this.mapSize = mapSize;
    this.carCount = carCount;
  }

  spawnCars() {
    const wideRoadIntersections = this.intersections.filter(
      intersection => intersection.roads.some(road => road.width > 6)
    );
    for (let i = 0; i < this.carCount && i < wideRoadIntersections.length; i++) {

      this.spawnCar(getRandomElement(wideRoadIntersections));
    }
  }

  spawnCar(startIntersection) {
    const carModel = getRandomElement(cars).modelData.clone(true);
    carModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const car = new Car(carModel, startIntersection, this.mapSize)
    car.position.set(startIntersection.x - this.mapSize / 2, 0, startIntersection.y - this.mapSize / 2);
    this.activeCars.push(car);
    this.scene.add(car);
  }

  update() {
    const delta = this.clock.getDelta();
    const halfMap = this.mapSize / 2;
    for (let i = this.activeCars.length - 1; i >= 0; i--) {
      const car = this.activeCars[i];
      if (car.nextIntersection) {
        const dir = new THREE.Vector3(
          car.nextIntersection.x - car.currentIntersection.x,
          0,
          car.nextIntersection.y - car.currentIntersection.y
        ).normalize();

        const carObject = car.children[0];
        const lookTarget = new THREE.Vector3().copy(car.position).add(dir);
        carObject.lookAt(lookTarget);
        car.translateOnAxis(dir, car.speed * delta);

        const x = car.position.x;
        const z = car.position.z;
        if (x < -halfMap || x > halfMap || z < -halfMap || z > halfMap) {
          this.scene.remove(car);
          this.activeCars.splice(i, 1);
          continue;
        }

        const nextPos = new THREE.Vector3(
          car.nextIntersection.x - halfMap,
          0,
          car.nextIntersection.y - halfMap
        );
        if (car.position.distanceTo(nextPos) < 0.1) {
          car.selectNextIntersection();
        }
      }
    }
  }

  clearCars() {
    for (const car of this.activeCars) {
      this.scene.remove(car);
    }
    this.activeCars = [];
  }

  setIntersections(newIntersections) {
    this.intersections = newIntersections;
  }

  setCarCount(newCarCount) {
    this.carCount = newCarCount
  }
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default CarAnimator;
