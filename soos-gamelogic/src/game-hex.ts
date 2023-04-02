import GameTown from './game-town.js';
import { resourceToLand, resourceToLetter, resourceToString, ResourceType, TerrainType } from './terrain-type.js';
import HexCoords from './utils/hex-coords.js';
import VertexCoords, { VertexDirection } from './utils/vertex-coords.js';

export default class GameHex {
  coords: HexCoords;
  terrainType: TerrainType;
  resourceType?: ResourceType;
  frequency?: number;

  constructor(coords: HexCoords, terrainType: TerrainType, resourceType?: ResourceType, frequency?: number) {
    //id = 'h:'+coords.x+','+coords.y;
    this.coords = coords;
    this.terrainType = terrainType;
    this.resourceType = resourceType;
    this.frequency = frequency;
  }

  getLandType(): string | undefined {
    if (!this.resourceType) {
      return undefined;
    }

    return resourceToLand(this.resourceType);
  }

  getType() {
    return "GameHex";
  }

  toString() {
    let returnString = "";
    if (this.terrainType === TerrainType.Empty)
      returnString = "e";
    else
      returnString = resourceToLetter(this.resourceType);

    if (this.frequency)
      return returnString + "," + this.frequency;
    else
      return returnString + ",";
  }
}
