import HexCoords, { HexDirection, hexDirOpposite } from './hex-coords';

const HexDirectionsNeedNormalize = Object.freeze([
  HexDirection.E,
  HexDirection.SE,
  HexDirection.SW,
])

export default class EdgeCoords {
  hexCoords: HexCoords;
  direction: HexDirection;

  constructor(coords: HexCoords, direction: HexDirection) {
    this.hexCoords = coords;
    this.direction = direction;
  }

  normalize() {
    if (HexDirectionsNeedNormalize.includes(this.direction)) {
      this.hexCoords = this.hexCoords.add(this.direction);
      this.direction = hexDirOpposite(this.direction);
    }
  }
}