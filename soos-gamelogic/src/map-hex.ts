import MapTown from './map-town';
import { resourceToLand, ResourceType, TerrainType } from './terrain-type';
import HexCoords from './utils/hex-coords';
import VertexCoords from './utils/vertex-coords';



export default class MapHex {
  coords: HexCoords;
  terrainType: TerrainType;
  resourceType?: ResourceType;
  frequency?: number;
  towns:MapTown[];

  constructor(coords: HexCoords, terrainType: TerrainType, resourceType?: ResourceType, frequency?: number) {
    //id = 'h:'+coords.x+','+coords.y;
    this.coords = coords;
    this.terrainType = terrainType;
    this.resourceType = resourceType;
    this.frequency = frequency;
    this.towns = [];
  }

  getLandType(): string | undefined {
    if (!this.resourceType) {
      return undefined;
    }

    return resourceToLand(this.resourceType);
  }

  getType(){
    return "MapHex";
  }

  addTown(direction:number){
    this.towns.push(new MapTown(new VertexCoords(this.coords, direction)));
  }

  townExists(direction:number):boolean{
    for (let i = 0; i<this.towns?.length;i++){
      if(this.towns[i].coords.direction===direction){
        return true;
      }
    }
    return false;
  }
}
