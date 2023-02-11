import { resourceToLand, ResourceType, TerrainType } from './terrain-type';
import HexCoords from './utils/hex-coords';

export default class MapHex {
  coords: HexCoords;
  terrainType: TerrainType;
  resourceType?: ResourceType;
  frequency?: number;

  constructor(coords: HexCoords, terrainType: TerrainType, resourceType?: ResourceType, frequency?: number) {
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
}
