import GameHex from './game-hex.js';
import GameRoad from './game-road.js';
import GameTown from './game-town.js';
import { BuildAction, BuildActionType } from './index.js';
import { AllResourceTypes, isSeaType, ResourceType, stringToResource, TerrainType } from './terrain-type.js';
import EdgeCoords from './utils/edge-coords.js';
import HexCoords, { AllHexDirections, hydrateHexCoords } from './utils/hex-coords.js';
import VertexCoords, { AllVertexDirections, edgeToVertex, getEdges, getHexes } from './utils/vertex-coords.js';

const OriginalTiles = Object.freeze([ 'b', 'b', 'b', 'o', 'o', 'o', 'w', 'w', 'w', 'w', 'g', 'g', 'g', 'g', 's', 's', 's', 's', 'd' ]);
const OriginalNumbers = Object.freeze([ 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12 ]); //with creative seatile maps
const OriginalSeaTiles = Object.freeze([ 'b', 'o', 'w', 's', 'g', '/', '/', '/', '/', '/b', '/o', '/w', '/g', '/s', '/a', '/a', '/a', '/a' ]);

const OriginalTerrain = Object.freeze([
  [ 'e', 'e', '~', '~', '~', '~', 'e' ],
  [ 'e', '~', '~', '~', '~', '~', 'e' ],
  [ 'e', '~', '~', '~', '~', '~', '~' ],
  [ '~', '~', '~', '~', '~', '~', '~' ],
  [ 'e', '~', '~', '~', '~', '~', '~' ],
  [ 'e', '~', '~', '~', '~', '~', 'e' ],
  [ 'e', 'e', '~', '~', '~', '~', 'e' ],
]);

export default class GameMap {
  board: GameHex[][];

  // TODO convert to dictionary
  towns: GameTown[];
  roads: GameRoad[];
  robberLocation: HexCoords;

  constructor() {
    this.board = [];
    this.towns = [];
    this.roads = [];
    this.robberLocation = new HexCoords(0, 0);
    this.initializeBoard();
  }

  initializeBoard() {
    const BoardHeight = OriginalTerrain.length;
    const BoardWidth = OriginalTerrain[0].length;
    let tilePile = this.stringToResourcePile(OriginalTiles);
    const seaTilePile = this.stringToResourcePile(OriginalSeaTiles);
    const creativeMap = true;
    if (creativeMap) {
      tilePile = tilePile.concat(seaTilePile);
    }

    const numberPile = OriginalNumbers.slice();
    for (let y = 0; y < BoardHeight; y++) {
      const hexRow: GameHex[] = [];
      for (let x = 0; x < BoardWidth; x++) {

        //add Hexes to the map
        let hexTerrain = TerrainType.Empty;
        let hexResource: ResourceType | undefined = undefined;
        let hexFrequency: number | undefined = undefined;
        let pullTerrainTile = false;
        switch (OriginalTerrain[y][x]) {
        case '~': //either water OR land!
          pullTerrainTile = true;
          break;
        case '/':
          hexTerrain = TerrainType.Water;
          break;
        case '?':
          hexTerrain = TerrainType.Land;
          pullTerrainTile = true;
          break;
        default:
          hexTerrain = TerrainType.Empty;
          break;
        }
        if (pullTerrainTile) {
          let tileIndex = 0;
          if (tilePile.length > 1) {
            tileIndex = Math.floor(Math.random() * tilePile.length);
            hexResource = tilePile[tileIndex];
          } else if (tilePile.length === 1) {
            hexResource = tilePile[0];
          } else {
            throw ErrorEvent;
          }
          tilePile.splice(tileIndex, 1);

          if (hexResource !== ResourceType.None && !isSeaType(hexResource)) {
            const frequencyIndex = Math.floor(Math.random() * numberPile.length);
            hexFrequency = numberPile[frequencyIndex];
            numberPile.splice(frequencyIndex, 1);
          }

          if (isSeaType(hexResource)) {
            hexTerrain = TerrainType.Water;
          } else {
            hexTerrain = TerrainType.Land; //empty tiles don't get to pull a tile
          }
        }
        const newHex = new GameHex(new HexCoords(x, y), hexTerrain, hexResource, hexFrequency);

        if (hexResource === ResourceType.None) {
          this.robberLocation = newHex.coords;
        }
        hexRow.push(newHex);
      }
      this.board.push(hexRow);
    }

    // add town spots & roads to each hex
    for (let y = 0; y < BoardHeight; y++) {
      for (let x = 0; x < BoardWidth; x++) {
        if (this.board[y][x].terrainType === TerrainType.Land) {
          for (const direction of AllVertexDirections) {
            const townCoords = new VertexCoords(new HexCoords(x, y), direction);
            if (!this.townExists(townCoords)) {
              this.addTown(townCoords);
            }
          }
          for (const edge of AllHexDirections) {
            const roadCoords = new EdgeCoords(new HexCoords(x, y), edge);
            if (!this.roadExists(roadCoords)) {
              this.addRoad(roadCoords);
            }
          }
        }
      }
    }
  }

  getFrequency(diceRoll: number): GameHex[] {
    const BoardHeight = OriginalTerrain.length;
    const BoardWidth = OriginalTerrain[0].length;
    const hexes: GameHex[] = [];
    for (let y = 0; y < BoardHeight; y++) {
      for (let x = 0; x < BoardWidth; x++) {
        if (this.board[y][x].frequency && this.board[y][x].frequency === diceRoll) {
          hexes.push(this.board[y][x]);
        }
      }
    }
    return hexes;
  }

  getHex(coords: HexCoords): GameHex | undefined {
    const row = this.board[coords.y];
    if (!row) {
      return undefined;
    }
    return row[coords.x] ? row[coords.x] : undefined;
  }

  addTown(coords: VertexCoords) {
    const newTown = new GameTown(coords);
    if (newTown.coords) {
      for (const hc of getHexes(newTown.coords)) {
        const hex = this.getHex(hc);
        if (hex && hex.frequency && hex.resourceType) {
          newTown.production[hex.resourceType] += hex.production;
          //trade = Math.max(trade, hex.getTrade());
        }
      }
    }
    this.towns.push(newTown);
  }

  getTownProductionResources(coords: VertexCoords): number[] | undefined {
    const town = this.townAt(coords);
    if (!town) {
      return undefined;
    }

    const production: number[] = [];
    for (let i = 0; i < AllResourceTypes.length; i++) {
      production.push(0);
    }

    if (town.coords) {
      for (const hc of getHexes(town.coords)) {
        const hex = this.getHex(hc);
        if (hex && hex.frequency && hex.resourceType) {
          production[hex.resourceType] += hex.production;
        }
      }
    }
    return production;
  }

  townExists(coords: VertexCoords) {
    // TODO convert to dictionary
    for (const town of this.towns) {
      if (town.coords && town.coords.equals(coords)) {
        return true;
      }
    }
    return false;
  }

  townAt(coords: VertexCoords): GameTown | undefined {
    // TODO convert to dictionary
    for (const town of this.towns) {
      if (town.coords && town.coords.equals(coords)) {
        return town;
      }
    }
    console.log('town not found!');
    return undefined;
  }

  addRoad(coords: EdgeCoords) {
    this.roads.push(new GameRoad(coords));
  }

  roadExists(coords: EdgeCoords) {
    // TODO convert to dictionary
    for (const road of this.roads) {
      if (road.coords.equals(coords)) {
        return true;
      }
    }
    return false;
  }

  roadAt(coords: EdgeCoords): GameRoad | undefined {
    // TODO convert to dictionary
    for (const road of this.roads) {
      if (road.coords.equals(coords)) {
        return road;
      }
    }
    return undefined;
  }

  stringToResourcePile(jsonMap: readonly string[]) {
    const resourcePile: ResourceType[] = [];
    for (let i = 0; i < jsonMap.length; i++) {
      resourcePile.push(stringToResource(jsonMap[i]));
    }
    return resourcePile;
  }

  getNeighboringRoads(town: GameTown): (GameRoad | undefined)[] {
    return this.getRoads(town.getCoords());
  }

  getTowns(road: GameRoad) {
    const returnTowns: GameTown[] = [];
    let theTown = this.townAt(new VertexCoords(road.coords.hexCoords, edgeToVertex(road.coords.direction)));
    if (theTown) {
      returnTowns.push(theTown);
    }

    theTown = this.townAt(new VertexCoords(road.coords.hexCoords, edgeToVertex((road.coords.direction + 1) % 6)));
    if (theTown) {
      returnTowns.push(theTown);
    }

    return returnTowns;
  }

  getTownsAt(hex: HexCoords) {
    const returnTowns: GameTown[] = [];
    for (const dir of AllVertexDirections) {
      const theTown = this.townAt(new VertexCoords(hex, dir));
      if (theTown) {
        returnTowns.push(theTown);
      }
    }
    return returnTowns;
  }

  getRoads(vertex: VertexCoords | undefined): (GameRoad | undefined)[] {
    //each vertex has N, SE, SW roads OR S, NE, NW roads on neighboring land.
    const egressRoads: (GameRoad | undefined)[] = [];
    if (!vertex) {
      return egressRoads;
    }

    for (const edge of getEdges(vertex)) {
      egressRoads.push(this.roadAt(edge));
    }
    return egressRoads;
  }

  buildableRoadLocations(playerIdx: number, playerPremoves:BuildAction[]): EdgeCoords[] {
    const roadLocations: { [edgeCoordsStr: string]: EdgeCoords } = {};
    const visitedVertices: { [vertexCoordsStr: string]: true } = {};
    console.log('using premoves: ' + playerPremoves.length);
    for (const road of this.roads) {
      const roadCoordsStr = road.coords.toString();
      const isRoadPremoved = this.roadPremovePresent(road.coords, playerIdx, playerPremoves);
      if (road.coords  && !roadLocations[roadCoordsStr] && (road.playerIdx === playerIdx || isRoadPremoved)) {
        roadLocations[roadCoordsStr] = road.coords;
        const bothTowns = this.getTowns(road);
        for (const town of bothTowns) {
          if (town && town.coords && town.playerIdx!==undefined && (town.isUnclaimed() || town.playerIdx===playerIdx)) {
            this.buildableRoadLocationsRecursive(playerIdx, town.coords, roadLocations, visitedVertices, playerPremoves);
          }
        }
      }
    }

    return Object.values(roadLocations);
  }

  private buildableRoadLocationsRecursive(
    playerIdx: number,
    vertexCoords: VertexCoords,
    roadLocations: { [edgeCoordsStr: string]: EdgeCoords },
    visitedVertices: { [vertexCoordsStr: string]: true },
    playerPremoves: BuildAction[],
  ): void {
    if (visitedVertices[vertexCoords.toString()]) {
      return;
    }
    visitedVertices[vertexCoords.toString()] = true;
    const vertTown = this.townAt(vertexCoords);
    if(vertTown && !vertTown.isUnclaimed() &&vertTown.playerIdx!==undefined && vertTown.playerIdx!== playerIdx){
      //console.log('cant build past opponents towns!');
      return; // can't build past opponents towns!
    }
    const egressRoads = this.getRoads(vertexCoords);
    for (const road of egressRoads) {
      // off edge of map
      if (!road) {
        continue;
      }

      const roadCoordsStr = road.coords.toString();
      const isRoadPremoved = this.roadPremovePresent(road.coords, playerIdx, playerPremoves);
      let keepGoing =false;
      if (!roadLocations[roadCoordsStr] && road.playerIdx === undefined) {
        roadLocations[roadCoordsStr] = road.coords;
      } else {
        keepGoing = true;
      }
      if(isRoadPremoved || (keepGoing && road.playerIdx === playerIdx )) {
        // continue on the other side
        const bothTowns = this.getTowns(road);
        const otherTown = bothTowns.find(t => !t.coords?.equals(vertexCoords));
        if (otherTown?.coords && (otherTown.isUnclaimed() || otherTown?.playerIdx === playerIdx)) {
          //console.log('continuing at ' + otherTown.coords?.toString());
          this.buildableRoadLocationsRecursive(playerIdx, otherTown.coords, roadLocations, visitedVertices, playerPremoves);
        }
      }
    }
  }

  settlePremovePresent(location: VertexCoords, playerId: number, playerPremoves:BuildAction[]): boolean {
    if (!this.townAt(location)?.isUnclaimed()) {
      return false;
    }
    for (const playerPremove of playerPremoves) {
      if (playerPremove.type !== BuildActionType.Settlement) {
        continue;
      }
      if (playerPremove.location !== location) {
        continue;
      }
      return true;
    }
    return false;
  }

  roadPremovePresent(location: EdgeCoords, playerId: number, playerPremoves:BuildAction[]): boolean {
    const road = this.roadAt(location);
    if (road && road.isClaimed()) {
      return false;
    }
    for (const playerPremove of playerPremoves) {
      if (playerPremove.type === BuildActionType.Road && playerPremove.location.equals(location)) {
        return true;
      }
    }
    return false;
  }

  buildableTownLocations(playerIdx: number, playerPremoves: BuildAction[]): VertexCoords[] {
    const townLocations: { [vertexCoordsStr: string]: VertexCoords } = {};
    for (const town of this.towns){
      if (!town.coords) {
        continue;
      }
      const townRoads = this.getRoads(town.coords);
      if (town.coords && town.isUnclaimed()){
        let foundRoad = false;
        for (const road of townRoads){
          if (road && road.playerIdx === playerIdx) {
            foundRoad = true;
          }
        }
        for (const premove of playerPremoves){
          if (premove.type === BuildActionType.Road){
            for (let i = 0; i<townRoads.length; i++){
              if(premove.location.equals(townRoads[i]?.coords)){
                foundRoad = true;
              }
            }
          }
        }
        if (foundRoad){
          townLocations[town.coords.toString()] = town.coords;
        }
      }
    }
    return Object.values(townLocations);
  }

  buildableCityLocations(playerIdx:number):VertexCoords[]{
    const cityLocations: { [vertexCoordsStr: string]: VertexCoords } = {};
    for (const town of this.towns){
      if (town.coords && town.playerIdx===playerIdx && town.townLevel<town.maxLevel){
        console.log('buildable city location:' + town.coords.toString());
        cityLocations[town.coords.toString()] = town.coords;
      }
    }
    return Object.values(cityLocations);
  }

  setChildPrototypes() {
    const BoardHeight = this.board.length;
    const BoardWidth = this.board[0].length;

    for (let y = 0; y < BoardHeight; y++) {
      for (let x = 0; x < BoardWidth; x++) {
        this.board[y][x] = new GameHex(
          hydrateHexCoords(this.board[y][x].coords),
          this.board[y][x].terrainType,
          this.board[y][x].resourceType,
          this.board[y][x].frequency,
        );
      }
    }

    for (let i = 0; i < this.towns.length; i++) {
      this.towns[i] = Object.assign(new GameTown(), this.towns[i]);
      this.towns[i].setChildPrototypes();
    }

    for (let i = 0; i < this.roads.length; i++) {
      this.roads[i] = Object.assign(new GameRoad(), this.roads[i]);
      this.roads[i].setChildPrototypes();
    }
  }
}
