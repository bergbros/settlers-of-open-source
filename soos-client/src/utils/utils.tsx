import { HexCoords, EdgeCoords, HexDirection, VertexCoords, VertexDirection } from 'soos-gamelogic';
import { hydrateEdgeCoords, vertexToEdge } from 'soos-gamelogic/dist/src/utils/edge-coords';
import { hydrateHexCoords } from 'soos-gamelogic/dist/src/utils/hex-coords';
import { hydrateVertexCoords } from 'soos-gamelogic/dist/src/utils/vertex-coords';

export const HexWidth = 100, HexHeight = 120;
export const BoardWidth = 7, BoardHeight = 7;
const leftPixelOffset = -BoardWidth / 2 * HexWidth - 55;
export type PixelCoords = {
  x: number,
  y: number
};

export function hexCoordsToPixels(hexCoords: HexCoords): PixelCoords {
  hexCoords = hydrateHexCoords(hexCoords);
  let xCoord = hexCoords.x * HexWidth;
  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += leftPixelOffset;
  const yCoord = hexCoords.y * HexHeight * .75 + leftPixelOffset;

  return {
    x: xCoord,
    y: yCoord,
  };
}

export function vertexCoordsToPixels(vertexCoords: VertexCoords, townRadius?: number): PixelCoords {
  vertexCoords = hydrateVertexCoords(vertexCoords);
  const settlementRadius = townRadius ? townRadius : 10;
  const hexCoords = vertexCoords.hexCoords;
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

  xCoord -= settlementRadius;
  yCoord -= settlementRadius * 1.2;

  return {
    x: xCoord,
    y: yCoord,
  };
}

export function edgeCoordsToPixels(edgeCoords: EdgeCoords): PixelCoords {
  edgeCoords = hydrateEdgeCoords(edgeCoords);
  const hexCoords = edgeCoords.hexCoords;
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
      xCoord -= edgeWidth;
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
    y: yCoord,
  };
}

export function setsAreEqual(setA: Set<string>, setB: Set<string>) {
  if (setA.size != setB.size)
    return false;

  if (!([...setA].every((element) => setB.has(element))))
    return false;

  return true;
}

export function printSocketMsg(msg: string) {
  console.log(msg);
}