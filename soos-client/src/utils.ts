import { HexCoords } from 'soos-gamelogic';

export const HexWidth = 100, HexHeight = 120;
export const BoardWidth = 7, BoardHeight = 7;

export type PixelCoords = {
  x: number,
  y: number
}

export function hexCoordsToPixels(hexCoords: HexCoords): PixelCoords {
  let xCoord = hexCoords.x * HexWidth;
  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += 55;
  const yCoord = hexCoords.y * HexHeight * .75 + 55;

  return {
    x: xCoord,
    y: yCoord
  }
}
