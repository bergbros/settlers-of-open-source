import HexCoords from './hex-coords';

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
}

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
])

export default class VertexCoords {
  hexCoords: HexCoords;
  direction: VertexDirection;

  constructor(coords: HexCoords, direction: VertexDirection) {
    this.hexCoords = coords;
    this.direction = direction;

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
      }

      this.hexCoords = new HexCoords(x, y);
    }
  }

  equals(other: VertexCoords): boolean {
    return other && this.hexCoords.equals(other.hexCoords) && this.direction === other.direction;
  }
}
