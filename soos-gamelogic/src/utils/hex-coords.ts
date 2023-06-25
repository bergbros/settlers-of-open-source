
// Implementation of "Offset Coordinates" from this blog post:
//
// https://www.redblobgames.com/grids/hexagons/#coordinates
//
// Note this uses the "odd-R" variant, which just means we're using pointy-top
// hexes, and odd rows are shoved right by 1/2 a column.
export default class HexCoords {
  // Once a HexCoords object is created, it cannot be changed.
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    // use Math.floor to ensure that x/y are integers
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }

  isShovedRight(): boolean {
    return this.y % 2 === 1;
  }

  // Returns the coordinates of the hex in the given direction from this hex.
  add(direction: HexDirection): HexCoords {
    return this.addHC(direction);
  }

  addHC(direction: HexDirection): HexCoords {
    const coords = hexDirToCoords(direction);

    let x = this.x + coords.x;
    const y = this.y + coords.y;

    // Handle offsets for weird rows
    if (this.y !== y && coords.x === 1 && !this.isShovedRight()) {
      x -= 1;
    } else if (this.y !== y && coords.x === -1 && this.isShovedRight()) {
      x += 1;
    }

    return new HexCoords(x, y);
  }

  toString(): string {
    return `(${this.x},${this.y})`;
  }

  equals(other: HexCoords): boolean {
    return other && this.x === other.x && this.y === other.y;
  }

}

export enum HexDirection {
  // in clockwise order
  NE = 0,
  E = 1,
  SE = 2,
  SW = 3,
  W = 4,
  NW = 5,
}

export const AllHexDirections = Object.freeze([
  HexDirection.NE,
  HexDirection.E,
  HexDirection.SE,
  HexDirection.SW,
  HexDirection.W,
  HexDirection.NW,
]);

export const hexDirNames = {
  [HexDirection.NE]: 'NE',
  [HexDirection.E]: 'E',
  [HexDirection.SE]: 'SE',
  [HexDirection.SW]: 'SW',
  [HexDirection.W]: 'W',
  [HexDirection.NW]: 'NW',
};

export function hexDirName(dir: HexDirection): string {
  return hexDirNames[dir];
}

// Note that 0,0 is the top left corner, and increasing numbers go down/left from there
const _dirToCoords = Object.freeze({
  [HexDirection.NE]: new HexCoords(1, -1),
  [HexDirection.E]: new HexCoords(1, 0),
  [HexDirection.SE]: new HexCoords(1, 1),
  [HexDirection.SW]: new HexCoords(-1, 1),
  [HexDirection.W]: new HexCoords(-1, 0),
  [HexDirection.NW]: new HexCoords(-1, -1),
});

// Convert a HexDirection enum to a HexCoords object containing the actual x/y offset for that direction.
export function hexDirToCoords(dir: HexDirection): HexCoords {

  return _dirToCoords[dir];
}

const opposites = Object.freeze({
  [HexDirection.NE]: HexDirection.SW,
  [HexDirection.E]: HexDirection.W,
  [HexDirection.SE]: HexDirection.NW,
  [HexDirection.SW]: HexDirection.NE,
  [HexDirection.W]: HexDirection.E,
  [HexDirection.NW]: HexDirection.SE,
});

// Get the opposite direction of a direction
export function hexDirOpposite(dir: HexDirection): HexDirection {
  return opposites[dir];
}
