import GameTown from './game-town.js';
import { isSeaType, resourceToLand, resourceToLetter, resourceToString, ResourceType, TerrainType } from './terrain-type.js';
import HexCoords from './utils/hex-coords.js';
import VertexCoords, { VertexDirection } from './utils/vertex-coords.js';

export default class GameHex {
  coords: HexCoords;
  terrainType: TerrainType;
  resourceType?: ResourceType;
  frequency?: number;
  production: number; //per 36 turns

  constructor(coords: HexCoords, terrainType: TerrainType, resourceType?: ResourceType, frequency?: number) {
    //id = 'h:'+coords.x+','+coords.y;
    this.coords = coords;
    this.terrainType = terrainType;
    this.resourceType = resourceType;
    this.frequency = frequency;
    this.production = this.getProduction(this.frequency);
  }

  getLandType(): string | undefined {
    if (this.resourceType === undefined) {
      return undefined;
    }

    return resourceToLand(this.resourceType);
  }

  getType() {
    return 'GameHex';
  }

  toString() {
    let returnString = '';
    if (this.terrainType === TerrainType.Empty) {
      returnString = 'e';
    } else {
      returnString = resourceToLetter(this.resourceType);
    }

    if (this.frequency) {
      return returnString + ',' + this.frequency;
    } else {
      return returnString + ',';
    }
  }

  getTrade() {
    if (isSeaType(this.resourceType) && this.resourceType !== ResourceType.WaterNone) {
      if (this.resourceType === ResourceType.AnyPort) {
        return 1; //3:1 any port is worth 3 production /36 turns
      } else {
        return 1;//2:1 any port is worth 2 production /36 turns... in reality this depends on relative abundance of each resource...
      }
    }
    return 0;
  }

  getProduction(freq: number | undefined) {
    if (!freq) {
      return 0;
    }
    return 6 - Math.abs(7 - freq);
  }
}
