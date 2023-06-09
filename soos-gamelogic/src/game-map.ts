import GameHex from './game-hex.js';
import GamePlayer from './game-player.js';
import GameRoad from './game-road.js';
import GameTown from './game-town.js';
import { AllResourceTypes, isSeaType, ResourceType, stringToResource, TerrainType } from './terrain-type.js';
import EdgeCoords, { vertexToEdge } from './utils/edge-coords.js';
import HexCoords, { AllHexDirections, HexDirection } from './utils/hex-coords.js';
import VertexCoords, { AllVertexDirections, edgeToVertex, getEdges, getHexes, VertexDirection, vertexDirName } from './utils/vertex-coords.js';

const OriginalTiles = Object.freeze(['b', 'b', 'b', 'o', 'o', 'o', 'w', 'w', 'w', 'w', 'g', 'g', 'g', 'g', 's', 's', 's', 's', 'd']);
//const OriginalNumbers = Object.freeze([2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]);
const OriginalNumbers = Object.freeze([2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12]); //with creative seatile maps 
const OriginalSeaTiles = Object.freeze(['b', 'o', 'w', 's', 'g', '/', '/', '/', '/', '/b', '/o', '/w', '/g', '/s', '/a', '/a', '/a', '/a']);
// const OriginalTerrain = Object.freeze([
//   ['e', 'e', '/', '/', '/', '/', 'e'],
//   ['e', '/', '?', '?', '?', '/', 'e'],
//   ['e', '/', '?', '?', '?', '?', '/'],
//   ['/', '?', '?', '?', '?', '?', '/'],
//   ['e', '/', '?', '?', '?', '?', '/'],
//   ['e', '/', '?', '?', '?', '/', 'e'],
//   ['e', 'e', '/', '/', '/', '/', 'e'],
// ]);

const OriginalTerrain = Object.freeze([
  ['e', 'e', '~', '~', '~', '~', 'e'],
  ['e', '~', '~', '~', '~', '~', 'e'],
  ['e', '~', '~', '~', '~', '~', '~'],
  ['~', '~', '~', '~', '~', '~', '~'],
  ['e', '~', '~', '~', '~', '~', '~'],
  ['e', '~', '~', '~', '~', '~', 'e'],
  ['e', 'e', '~', '~', '~', '~', 'e'],
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
    const newTown = new GameTown(coords);
    let production = 0;
    //let trade = 0;
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
    if (!town) return undefined;

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

    for (const edge of getEdges(vertex)) {
      egressRoads.push(this.roadAt(edge));
    }
    return egressRoads;
    //get the two neighboring edges of this particular hex:
    // egressRoads.push(this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge(vertex.direction))));
    // egressRoads.push(this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge((vertex.direction + 5) % 6))));

    // //get the one sticking out from the vertex
    // let lastRoad = this.roadAt(new EdgeCoords(vertex.hexCoords, vertexToEdge(vertex.direction)));
    // switch (vertex.direction) {
    //   case VertexDirection.N:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - ((vertex.hexCoords.y + 1) % 2), vertex.hexCoords.y - 1), HexDirection.E));
    //     break;
    //   case VertexDirection.S:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + vertex.hexCoords.y % 2, vertex.hexCoords.y + 1), HexDirection.E));
    //     break;
    //   case VertexDirection.NE:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + 1, vertex.hexCoords.y), HexDirection.NW));
    //     break;
    //   case VertexDirection.SE:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x + 1, vertex.hexCoords.y), HexDirection.SW));
    //     break;
    //   case VertexDirection.NW:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - 1, vertex.hexCoords.y), HexDirection.NE));
    //     break;
    //   case VertexDirection.SW:
    //     lastRoad = this.roadAt(new EdgeCoords(new HexCoords(vertex.hexCoords.x - 1, vertex.hexCoords.y), HexDirection.SE));
    //     break;
    //   default:
    //     lastRoad = undefined;
    //     break;
    // }
    // egressRoads.push(lastRoad);

    // return egressRoads;
  }

  toString() {
    let returnString = "";

    for (const road of this.roads) {
      const roadString = road.toString();
      if (roadString.length > 0)
        returnString = returnString + "/" + roadString;
    }

    for (const town of this.towns) {
      const townString = town.toString();
      if (townString.length > 0)
        returnString = returnString + "/" + townString;
    }

    return returnString;
  }

  hexToString() {
    let returnArray = "";
    const BoardHeight = OriginalTerrain.length;
    const BoardWidth = OriginalTerrain[0].length;

    for (let y = 0; y < BoardHeight; y++) {
      let returnRow = "";
      for (let x = 0; x < BoardWidth; x++) {
        returnRow = returnRow + this.board[y][x].toString() + ";"
      }
      returnArray = returnArray + (returnRow) + "%";
    }
  }

  initBoardFromString(json: string) {
    let rowCount = 0;
    let colCount = 0;
    this.board = [];

    for (const jsonRow of json.split("%")) {
      const row: GameHex[] = [];
      for (const hf of jsonRow.split(";")) {

        let hexTerrain = TerrainType.Empty;
        let hexResource: ResourceType | undefined = undefined;
        let hexFrequency: number | undefined = undefined;
        let pullTerrainTile = false;

        const [h, f] = hf.split(",");
        switch (h) {
          case '/':
            hexTerrain = TerrainType.Water;
            break;
          case '?':
            hexTerrain = TerrainType.Land;
            hexResource = stringToResource(h);
            break;
          default:
            hexTerrain = TerrainType.Empty;
            break;
        }

        if (f.length > 0)
          hexFrequency = +f;

        const hexCoords = new HexCoords(colCount, rowCount);
        row.push(new GameHex(hexCoords, hexTerrain, hexResource, hexFrequency))

        colCount++;
      }

      this.board.push(row);
      rowCount++;
    }

    const BoardHeight = this.board.length;
    const BoardWidth = this.board[0].length;

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

  setChildPrototypes() {
    const BoardHeight = this.board.length;
    const BoardWidth = this.board[0].length;

    for (let y = 0; y < BoardHeight; y++) {
      for (let x = 0; x < BoardWidth; x++) {
        //this.board[y][x].coords = Object.assign(new HexCoords(), this.board[y][x].coords),
        this.board[y][x] = new GameHex(
          new HexCoords(this.board[y][x].coords.x, this.board[y][x].coords.y),
          this.board[y][x].terrainType,
          this.board[y][x].resourceType,
          this.board[y][x].frequency
        );
      }
    }

    // for (const boardRow of this.board) {
    //   for (const hex of boardRow) {
    //     Object.assign(new GameHex(), hex);
    //   }
    // }

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
