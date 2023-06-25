import EdgeCoords from './edge-coords.js';
import HexCoords, { HexDirection, hexDirToCoords } from './hex-coords.js';

export enum VertexDirection {
  // in clockwise order
  N = 0,
  NE = 1,
  SE = 2,
  S = 3,
  SW = 4,
  NW = 5,
}

export const AllVertexDirections = Object.freeze([
  VertexDirection.N,
  VertexDirection.NE,
  VertexDirection.SE,
  VertexDirection.S,
  VertexDirection.SW,
  VertexDirection.NW,
]);

const hexDirNames = {
  [VertexDirection.N]: 'N',
  [VertexDirection.NE]: 'NE',
  [VertexDirection.SE]: 'SE',
  [VertexDirection.S]: 'S',
  [VertexDirection.SW]: 'SW',
  [VertexDirection.NW]: 'NW',
};

export function vertexDirName(dir: VertexDirection): string {
  return hexDirNames[dir];
}

const opposites = Object.freeze({
  [VertexDirection.N]: VertexDirection.S,
  [VertexDirection.NE]: VertexDirection.SW,
  [VertexDirection.SE]: VertexDirection.NW,
  [VertexDirection.S]: VertexDirection.N,
  [VertexDirection.SW]: VertexDirection.NE,
  [VertexDirection.NW]: VertexDirection.SE,
});

export function vertexDirOpposite(dir: VertexDirection): VertexDirection {
  return opposites[dir];
}

const VertexDirectionsNeedNormalize = Object.freeze([
  VertexDirection.NE,
  VertexDirection.SE,
  VertexDirection.S,
  VertexDirection.SW,
  // TODO add SW
]);

export default class VertexCoords {
  hexCoords: HexCoords;
  direction: VertexDirection;

  constructor(coords: HexCoords, direction: VertexDirection) {
    this.hexCoords = coords;
    this.direction = direction % 6;

    this.normalize();
  }

  normalize(): void {
    if (VertexDirectionsNeedNormalize.includes(this.direction)) {
      let x = this.hexCoords.x;
      let y = this.hexCoords.y;

      switch (this.direction) {
        case VertexDirection.NE:
          x++;
          this.direction = VertexDirection.NW;
          break;

        case VertexDirection.SE:
          x += y % 2;
          y++;
          this.direction = VertexDirection.N;
          break;

        case VertexDirection.S:
          x += y % 2;
          y++;
          this.direction = VertexDirection.NW;
          break;
        case VertexDirection.SW:
          x += y % 2 - 1;
          y++;
          this.direction = VertexDirection.N;
          break;
      }

      this.hexCoords = new HexCoords(x, y);
    }
  }

  equals(other: VertexCoords): boolean {
    return other && this.hexCoords.equals(other.hexCoords) && this.direction === other.direction;
  }

  toString(): string {
    // (3,4,dir=NW)
    return `(${this.hexCoords.x},${this.hexCoords.y},dir=${vertexDirName(this.direction)})`;
  }

}

export function edgeToVertex(direction: HexDirection): VertexDirection {
  const myvert = VertexDirection.N;
  switch (direction) {
    case HexDirection.NE: return VertexDirection.N;
    case HexDirection.E: return VertexDirection.NE;
    case HexDirection.SE: return VertexDirection.SE;
    case HexDirection.SW: return VertexDirection.S;
    case HexDirection.W: return VertexDirection.SW;
    case HexDirection.NW: return VertexDirection.NW;
  }
}

export function vertexDirToHexDirection(direction: VertexDirection) {
  switch (direction) {
    case VertexDirection.N: return HexDirection.NE;
    case VertexDirection.NE: return HexDirection.E;
    case VertexDirection.SE: return HexDirection.SE;
    case VertexDirection.S: return HexDirection.SW;
    case VertexDirection.SW: return HexDirection.W;
    case VertexDirection.NW: return HexDirection.NW;
  }
}
export function vertexDirToHexDirectionStaggered(direction: VertexDirection) {
  switch (direction) {
    case VertexDirection.N: return HexDirection.NW;
    case VertexDirection.NE: return HexDirection.NE;
    case VertexDirection.SE: return HexDirection.E;
    case VertexDirection.S: return HexDirection.SE;
    case VertexDirection.SW: return HexDirection.SW;
    case VertexDirection.NW: return HexDirection.W;
  }
}

export function getHexes(vertex: VertexCoords) {
  const adjHexes: HexCoords[] = [];
  adjHexes.push(vertex.hexCoords);
  adjHexes.push(vertex.hexCoords.addHC(vertexDirToHexDirection(vertex.direction)));
  adjHexes.push(vertex.hexCoords.addHC(vertexDirToHexDirectionStaggered(vertex.direction)));
  return adjHexes;
}

export function getEdges(vertex: VertexCoords) {
  const adjEdges: EdgeCoords[] = [];
  adjEdges.push(new EdgeCoords(vertex.hexCoords, vertexDirToHexDirection(vertex.direction)));
  adjEdges.push(new EdgeCoords(vertex.hexCoords, vertexDirToHexDirectionStaggered(vertex.direction)));
  //protruding edge:
  const newHC = vertex.hexCoords.addHC(vertexDirToHexDirection(vertex.direction));
  let newDir: HexDirection = HexDirection.E;
  switch (vertex.direction) {
    case VertexDirection.N: newDir = HexDirection.W; break;
    case VertexDirection.NE: newDir = HexDirection.NW; break;
    case VertexDirection.SE: newDir = HexDirection.NE; break;
    case VertexDirection.S: newDir = HexDirection.E; break;
    case VertexDirection.SW: newDir = HexDirection.SE; break;
    case VertexDirection.NW: newDir = HexDirection.SW; break;
  }
  adjEdges.push(new EdgeCoords(newHC, newDir));
  return adjEdges;
}
