import HexCoords, { AllHexDirections, HexDirection, hexDirOpposite, hexDirNames } from './hex-coords.js';
import { VertexDirection } from './vertex-coords.js';

const EdgeDirectionsNeedNormalize = Object.freeze([
  HexDirection.E,
  HexDirection.SE,
  HexDirection.SW,
]);

export function edgeDirName(dir: HexDirection): string {
  return hexDirNames[dir];
}

export function vertexToEdge(direction: VertexDirection) {
  switch (direction) {
  case VertexDirection.N:
    return HexDirection.NE;

  case VertexDirection.NE:
    return HexDirection.E;

  case VertexDirection.SE:
    return HexDirection.SE;

  case VertexDirection.S:
    return HexDirection.SW;

  case VertexDirection.SW:
    return HexDirection.W;

  case VertexDirection.NW:
    return HexDirection.NW;
  }
}

export default class EdgeCoords {
  hexCoords: HexCoords;
  direction: HexDirection;

  constructor(coords: HexCoords, direction: HexDirection) {
    this.hexCoords = coords;
    this.direction = direction;
    this.normalize();
  }

  normalize() {
    if (EdgeDirectionsNeedNormalize.includes(this.direction)) {
      this.hexCoords = this.hexCoords.add(this.direction);
      this.direction = hexDirOpposite(this.direction);
    }
  }

  equals(other: EdgeCoords): boolean {
    return other && this.hexCoords.equals(other.hexCoords) && this.direction === other.direction;
  }

  toString(): string {
    // (3,4,dir=NW)
    return `(${this.hexCoords.x},${this.hexCoords.y},${edgeDirName(this.direction)})`;
  }

}
