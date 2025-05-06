import { LSystemGenerator } from "./LSystemGenerator";
import * as THREE from "three";

class Agent {
  constructor(position = new THREE.Vector3(), direction = 0, length = 1) {
    this.position = position;
    this.direction = direction;
    this.length = length;
  }
}

export default Agent
