import Agent from "./agent";
import { LSystemGenerator } from "./LSystemGenerator";
import * as THREE from 'three';

class RoadVisualiser {
  lsystem = new LSystemGenerator();
  positions = [];
  length = 16;
  lengthDecay = 2;
  angle = 90;
  arrows = new THREE.Object3D();


  VisualiseSequence() {
    const sequence = this.lsystem.GenerateSentence();
    const saveStates = [];
    let currentPosition = new THREE.Vector3(0, .5, 0);
    let tempPosition = new THREE.Vector3(0, .5, 0);
    let direction = new THREE.Vector3(1, 0, 0);

    this.positions.push(currentPosition);

    // Log the initial state of the agent
    console.log("Initial Position:", currentPosition);
    console.log("Initial Direction:", direction);

    for (const c of sequence) {
      let command = Object.values(EncodingLetters).includes(c) ? c : null;

      switch (command) {
        case EncodingLetters.draw: {
          // Log before moving
          console.log("Before draw - Position:", currentPosition);
          console.log("Direction:", direction);
          tempPosition = currentPosition.clone();
          currentPosition.add(direction.clone().multiplyScalar(this.length));

          // Log after moving
          console.log("After draw - Position:", currentPosition);

          this.PlaceRoadHelper(tempPosition, direction, this.length);
          this.length -= this.lengthDecay;
          this.length = Math.max(this.length, 1)
          break;
        }
        case EncodingLetters.turnRight: {
          console.log("Before turnRight - Direction:", direction);

          const radians = -THREE.MathUtils.degToRad(this.angle);
          direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), radians);

          console.log("After turnRight - Direction:", direction);
          break;
        }
        case EncodingLetters.turnLeft: {
          console.log("Before turnLeft - Direction:", direction);

          const radians = THREE.MathUtils.degToRad(this.angle);
          direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), radians);

          console.log("After turnLeft - Direction:", direction);
          break;
        }
        case EncodingLetters.save: {
          console.log("Before save - Position:", currentPosition);
          console.log("Direction:", direction);

          saveStates.push(new Agent(currentPosition.clone(), direction.clone(), this.length));

          // Log the state when saved
          console.log("Saved state - Position:", currentPosition);
          console.log("Direction:", direction);
          break;
        }
        case EncodingLetters.load: {
          if (saveStates.length > 0) {
            const agentState = saveStates.pop();
            currentPosition = agentState.position;
            direction = agentState.direction;
            this.length = agentState.length;

            // Log the state when loaded
            console.log("Loaded state - Position:", currentPosition);
            console.log("Direction:", direction);
          } else {
            console.error("Loading with no save states");
          }
          break;
        }
        case EncodingLetters.unknown:
        default:
          console.warn("Unknown command:", c);
          break;
      }
    }
  }


  PlaceRoadHelper(position, direction, length) {
    console.log("road helper: " + position.x.toFixed(0) + ", " + position.z.toFixed(0));

    const arrowHelper = new THREE.ArrowHelper(direction, position, length, "#ff00ff");
    this.arrows.add(arrowHelper);
  }

  getArrows() { return this.arrows }
}

const EncodingLetters = Object.freeze({
  unknown: "1",
  save: '[',
  load: ']',
  draw: 'F',
  turnRight: "+",
  turnLeft: "-"
});

export default RoadVisualiser;