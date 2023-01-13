import HexCoords, { dirName, dirToCoords, HexDirection } from './hex-coords';

describe('HexCoords', () => {
  it('coords with odd Y coords are shoved right', () => {
    expect(new HexCoords(0, 0).isShovedRight()).toBe(false);
    expect(new HexCoords(0, 1).isShovedRight()).toBe(true);
    expect(new HexCoords(3, 6).isShovedRight()).toBe(false);
    expect(new HexCoords(3, 7).isShovedRight()).toBe(true);
  });

  it('adds directions correctly starting from even row', () => {
    const startingCoords = new HexCoords(2, 2);
    
    const results = {
      [HexDirection.UpRight]: new HexCoords(2, 1),
      [HexDirection.Right]: new HexCoords(3, 2),
      [HexDirection.DownRight]: new HexCoords(2, 3),
      [HexDirection.DownLeft]: new HexCoords(1, 3),
      [HexDirection.Left]: new HexCoords(1, 2),
      [HexDirection.UpLeft]: new HexCoords(1, 1),
    }

    for (const _direction in results) {
      const direction: HexDirection = Number(_direction) as HexDirection;
      const expected = results[direction];
      const result = startingCoords.add(direction);
      const msg = `${startingCoords.toString()} plus ${dirName(direction)} ${dirToCoords(direction)} = ${result.toString()}, expected ${expected.toString()}`;
      expect(result.x, msg).toEqual(expected.x);
      expect(result.y, msg).toEqual(expected.y);
    }
  });

  it('adds directions correctly starting from odd row', () => {
    const startingCoords = new HexCoords(3, 3);
    
    const results = {
      [HexDirection.UpRight]: new HexCoords(4, 2),
      [HexDirection.Right]: new HexCoords(4, 3),
      [HexDirection.DownRight]: new HexCoords(4, 4),
      [HexDirection.DownLeft]: new HexCoords(3, 4),
      [HexDirection.Left]: new HexCoords(2, 3),
      [HexDirection.UpLeft]: new HexCoords(3, 2),
    }

    for (const _direction in results) {
      const direction: HexDirection = Number(_direction) as HexDirection;
      const expected = results[direction];
      const result = startingCoords.add(direction);
      const msg = `${startingCoords.toString()} plus ${dirName(direction)} ${dirToCoords(direction)} = ${result.toString()}, expected ${expected.toString()}`;
      expect(result.x, msg).toEqual(expected.x);
      expect(result.y, msg).toEqual(expected.y);
    }
  });
});