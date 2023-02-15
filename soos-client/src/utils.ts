import { HexCoords } from 'soos-gamelogic';
import VertexCoords, { VertexDirection } from 'soos-gamelogic/src/utils/vertex-coords';

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

export function vertexCoordsToPixels(vertexCoords: VertexCoords): PixelCoords {
  //console.log("translating " + vertexCoords.coords.x + "," + vertexCoords.coords.y);
  let hexCoords = vertexCoords.coords;
  let xCoord = hexCoords.x * HexWidth;
  if (hexCoords.isShovedRight()) {
    xCoord += HexWidth * .5;
  }
  xCoord += 55;
  let yCoord = hexCoords.y * HexHeight * .75 + 55;

  switch(vertexCoords.direction){
    case VertexDirection.N:
      xCoord+=HexWidth*0.5;
      break;
    case VertexDirection.NE:
      xCoord+=HexWidth;
      yCoord+=HexHeight*0.25;
      break;
    case VertexDirection.NW:
      yCoord+=HexHeight*0.25;
      break;
    case VertexDirection.S:
      xCoord+=HexWidth*0.5;
      yCoord+=HexHeight;
      break;
    case VertexDirection.SE:
      xCoord+=HexWidth;
      yCoord+=HexHeight*0.75;
      break;
    case VertexDirection.SW:
      yCoord+=HexHeight*0.75;
      break;
  }

  const settlementRadius =10;
  xCoord-= settlementRadius;
  yCoord-=settlementRadius; 
  
  return {
    x: xCoord,
    y: yCoord
  }
}
