import HexCoords, { HexDirection } from './hex-coords';

const HexDirectionsNeedNormalize = Object.freeze([
  HexDirection.Right,
  HexDirection.DownRight,
  HexDirection.DownLeft,
])

export default class EdgeCoords {
  coords: HexCoords;
  direction: HexDirection;

  constructor(coords: HexCoords, direction: HexDirection) {
    this.coords = coords;
    this.direction = direction;
  }

  normalize() {
    if (HexDirectionsNeedNormalize.includes(this.direction)) {
      this.coords = this.coords.add(this.direction);
      // this.direction = this.direction.opp
    }
  }
}