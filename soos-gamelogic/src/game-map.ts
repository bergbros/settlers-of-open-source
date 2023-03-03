import GameHex from './gamehex';
import GameRoad from './gameroad';
import GameTown from './gametown';
import { ResourceType, stringToResource, TerrainType } from './terrain-type';
import EdgeCoords, { vertexToEdge } from './utils/edge-coords';
import HexCoords, { AllHexDirections, HexDirection } from './utils/hex-coords';
import VertexCoords, { AllVertexDirections, edgeToVertex, VertexDirection, vertexDirName } from './utils/vertex-coords';

const OriginalTiles = Object.freeze(['b', 'b', 'b', 'o', 'o', 'o', 'w', 'w', 'w', 'w', 'g', 'g', 'g', 'g', 's', 's', 's', 's', 'd']);
const OriginalNumbers = Object.freeze([2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]);

const OriginalTerrain = Object.freeze([
  ['e', 'e', '/', '/', '/', '/', 'e'],
  ['e', '/', '?', '?', '?', '/', 'e'],
  ['e', '/', '?', '?', '?', '?', '/'],
  ['/', '?', '?', '?', '?', '?', '/'],
  ['e', '/', '?', '?', '?', '?', '/'],
  ['e', '/', '?', '?', '?', '/', 'e'],
  ['e', 'e', '/', '/', '/', '/', 'e'],
]);

export default class GameMap {
  board: GameHex[][];

  // TODO convert to dictionary
  towns: GameTown[];
  roads: GameRoad[];
  displayRoads: GameRoad[];
  robberLocation: HexCoords;
  constructor() {
    this.board = [];
    this.towns = [];
    this.roads = [];
    this.displayRoads = [];
    this.robberLocation = new HexCoords(0, 0);
    this.initializeBoard();
  }

  initializeBoard() {
    const BoardHeight = OriginalTerrain.length;
    const BoardWidth = OriginalTerrain[0].length;
    const tilePile = this.stringToResourcePile(OriginalTiles);
    const numberPile = OriginalNumbers.slice();
    for (let y = 0; y < BoardHeight; y++) {
      const isOffset: boolean = y % 2 === 1;
      const row = [];
      const freqRow = [];
      const hexRow: GameHex[] = [];
      for (let x = 0; x < BoardWidth; x++) {

        //add Hexes to the map
        let hexTerrain = TerrainType.Empty;
        let hexResource: ResourceType | undefined = undefined;
        let hexFrequency: number | undefined = undefined;
        let pullTerrainTile = false;
        switch (OriginalTerrain[y][x]) {
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

          const frequencyIndex = Math.floor(Math.random() * numberPile.length);
          if (hexResource !== ResourceType.None) {
            hexFrequency = numberPile[frequencyIndex];
            numberPile.splice(frequencyIndex, 1);
          }
        }
        const newHex = new GameHex(new HexCoords(x, y), hexTerrain, hexResource, hexFrequency);
        if (hexResource === ResourceType.None)
          this.robberLocation = newHex.coords;
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
            if (!this.roadExists(roadCoords))
              this.addRoad(roadCoords);
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
    return row[coords.x];
  }

  addTown(coords: VertexCoords) {
    this.towns.push(new GameTown(coords));
  }

  townExists(coords: VertexCoords) {
    // TODO convert to dictionary
    for (const town of this.towns) {
      if (town.coords.equals(coords)) {
        return true;
      }
    }
    return false;
  }

  townAt(coords: VertexCoords): GameTown | undefined {
    // TODO convert to dictionary
    for (const town of this.towns) {
      if (town.coords.equals(coords)) {
        return town;
      }
    }
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

  resetDisplayTowns() {
    for (const town of this.towns)
      town.resetDisplay();
  }

  resetDisplayRoads() {
    for (const road of this.roads)
      road.resetDisplay();
  }
  updateDisplayTowns(vertex?: VertexCoords) {
    if (!vertex) return;
    const town = this.townAt(vertex)
    if (town) town.display = true;
  }
  updateDisplayRoads(vertex?: VertexCoords) {
    if (!vertex) return;
    const roadArray = this.getRoads(vertex)
    for (const theRoad of roadArray) {
      if (theRoad)
        theRoad.setDisplay(true);
    }
  }

  getNeighboringRoads(town: GameTown): (GameRoad | undefined)[] {
    return this.getRoads(town.getCoords());
  }

  getTowns(road: GameRoad) {
    const returnTowns: GameTown[] = [];
    let theTown = this.townAt(new VertexCoords(road.coords.hexCoords, edgeToVertex(road.coords.direction)));
    if (theTown) returnTowns.push(theTown);

    theTown = this.townAt(new VertexCoords(road.coords.hexCoords, edgeToVertex((road.coords.direction + 1) % 6)));
    if (theTown) returnTowns.push(theTown);

    return returnTowns;
  }

  getTownsAt(hex: HexCoords) {
    const returnTowns: GameTown[] = [];
    for (const dir of AllVertexDirections) {
      let theTown = this.townAt(new VertexCoords(hex, dir));
      if (theTown)
        returnTowns.push(theTown);
    }
    return returnTowns;
  }

  getRoads(vertex: VertexCoords | undefined): (GameRoad | undefined)[] {

    //each vertex has N, SE, SW roads OR S, NE, NW roads on neighboring land.
    const egressRoads: (GameRoad | undefined)[] = [];
    if (!vertex) return egressRoads;

    //get the two neighboring edges of this particular hex:
    egressRoads.push(this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge(vertex.direction))));
    egressRoads.push(this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge((vertex.direction + 5) % 6))));

    //get the one sticking out from the vertex
    let lastRoad = this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge(vertex.direction)));
    switch (vertex.direction) {
      case VertexDirection.N:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - ((vertex.hexCoords.y + 1) % 2), vertex.hexCoords.y - 1), HexDirection.E));
        break;
      case VertexDirection.S:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + vertex.hexCoords.y % 2, vertex.hexCoords.y + 1), HexDirection.E));
        break;
      case VertexDirection.NE:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + 1, vertex.hexCoords.y), HexDirection.NW));
        break;
      case VertexDirection.SE:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + 1, vertex.hexCoords.y), HexDirection.SW));
        break;
      case VertexDirection.NW:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - 1, vertex.hexCoords.y), HexDirection.NE));
        break;
      case VertexDirection.SW:
        lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - 1, vertex.hexCoords.y), HexDirection.SE));
        break;
      default:
        lastRoad = undefined;
        break;
    }
    egressRoads.push(lastRoad);

    return egressRoads;
  }
}
