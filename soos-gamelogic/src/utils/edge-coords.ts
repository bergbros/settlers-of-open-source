import HexCoords, { AllHexDirections, HexDirection, hexDirOpposite, hexDirNames } from './hex-coords';



const EdgeDirectionsNeedNormalize = Object.freeze([
  HexDirection.E,
  HexDirection.SE,
  HexDirection.SW,
  HexDirection.NE,
])

export function edgeDirName(dir: HexDirection): string {
  return hexDirNames[dir];
}


export default class EdgeCoords {
  hexCoords: HexCoords;
  direction: HexDirection;

  constructor(coords: HexCoords, direction: HexDirection) {
    this.hexCoords = coords;
    this.direction = direction;
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
    return `(${this.hexCoords.x},${this.hexCoords.y},dir=${edgeDirName(this.direction)})`;
  }


}