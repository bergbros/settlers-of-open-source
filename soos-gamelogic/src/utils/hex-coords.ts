
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
    const coords = dirToCoords(direction);

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
}

export enum HexDirection {
  // in clockwise order
  UpRight = 0,
  Right = 1,
  DownRight = 2,
  DownLeft = 3,
  Left = 4,
  UpLeft = 5,
}

const hexDirNames = {
  [HexDirection.UpRight]: 'UpRight',
  [HexDirection.Right]: 'Right',
  [HexDirection.DownRight]: 'DownRight',
  [HexDirection.DownLeft]: 'DownLeft',
  [HexDirection.Left]: 'Left',
  [HexDirection.UpLeft]: 'UpLeft',
}

export function dirName(dir: HexDirection): string {
  return hexDirNames[dir];
}

// Note that 0,0 is the top left corner, and increasing numbers go down/left from there
const _dirToCoords = Object.freeze({
  [HexDirection.UpRight]: new HexCoords(1, -1),
  [HexDirection.Right]: new HexCoords(1, 0),
  [HexDirection.DownRight]: new HexCoords(1, 1),
  [HexDirection.DownLeft]: new HexCoords(-1, 1),
  [HexDirection.Left]: new HexCoords(-1, 0),
  [HexDirection.UpLeft]: new HexCoords(-1, -1),
});

// Convert a HexDirection enum to a HexCoords object containing the actual x/y offset for that direction.
export function dirToCoords(dir: HexDirection): HexCoords {
  return _dirToCoords[dir];
}
