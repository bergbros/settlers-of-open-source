import { HexCoords } from 'soos-gamelogic';
import EdgeCoords from 'soos-gamelogic/src/utils/edge-coords';
import { HexDirection } from 'soos-gamelogic/src/utils/hex-coords';
import VertexCoords, { VertexDirection } from 'soos-gamelogic/src/utils/vertex-coords';

export const HexWidth = 100, HexHeight = 120;
export const BoardWidth = 7, BoardHeight = 7;
const leftPixelOffset = 55;
export type PixelCoords = {
  x: number,
  y: number
}

export function hexCoordsToPixels(hexCoords: HexCoords): PixelCoords {
  let xCoord = hexCoords.x * HexWidth;
  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += leftPixelOffset;
  const yCoord = hexCoords.y * HexHeight * .75 + leftPixelOffset;

  return {
    x: xCoord,
    y: yCoord
  }
}

export function vertexCoordsToPixels(vertexCoords: VertexCoords): PixelCoords {
  //console.log("translating " + vertexCoords.coords.x + "," + vertexCoords.coords.y);
  let hexCoords = vertexCoords.hexCoords;
  let xCoord = hexCoords.x * HexWidth;
  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += leftPixelOffset;
  let yCoord = hexCoords.y * HexHeight * .75 + leftPixelOffset;

  switch (vertexCoords.direction) {
    case VertexDirection.N:
      xCoord += HexWidth * 0.5;
      break;
    case VertexDirection.NE:
      xCoord += HexWidth;
      yCoord += HexHeight * 0.25;
      break;
    case VertexDirection.NW:
      yCoord += HexHeight * 0.25;
      break;
    case VertexDirection.S:
      xCoord += HexWidth * 0.5;
      yCoord += HexHeight;
      break;
    case VertexDirection.SE:
      xCoord += HexWidth;
      yCoord += HexHeight * 0.75;
      break;
    case VertexDirection.SW:
      yCoord += HexHeight * 0.75;
      break;
  }

  const settlementRadius = 10;
  xCoord -= settlementRadius;
  yCoord -= settlementRadius;

  return {
    x: xCoord,
    y: yCoord
  }
}


export function edgeCoordsToPixels(edgeCoords: EdgeCoords): PixelCoords {
  //console.log("translating " + vertexCoords.coords.x + "," + vertexCoords.coords.y);
  let hexCoords = edgeCoords.hexCoords;
  let xCoord = hexCoords.x * HexWidth;

  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += leftPixelOffset;
  let yCoord = hexCoords.y * HexHeight * .75 + leftPixelOffset;

  const edgeWidth = 5;

  switch (edgeCoords.direction) {
    case HexDirection.NW:
      break;
    case HexDirection.NE:
      xCoord += HexWidth * 0.5;
      break;
    case HexDirection.E:
      xCoord += HexWidth - edgeWidth;
      yCoord += HexHeight * 0.25 + 15;
      break;
    case HexDirection.W:
      xCoord-= edgeWidth;
      yCoord += HexHeight * 0.25 + 15;
      break;
    case HexDirection.SE:
      xCoord += HexWidth * 0.5;
      yCoord += HexHeight * 0.75;
      break;
    case HexDirection.SW:
      yCoord += HexHeight * 0.75;
      break;
  }

  return {
    x: xCoord,
    y: yCoord
  }
}
