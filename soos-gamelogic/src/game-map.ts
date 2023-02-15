import MapHex from './map-hex';
import MapTown, { MapRoad } from './map-town';
import { ResourceType, stringToResource, TerrainType } from './terrain-type';
import HexCoords from './utils/hex-coords';
import VertexCoords from './utils/vertex-coords';

const OriginalTiles = Object.freeze(['b','b','b','o','o','o','w','w','w','w','g','g','g','g','s','s','s','s','d']);
const OriginalNumbers = Object.freeze([2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12]);

const OriginalTerrain = Object.freeze([
  [ 'e', 'e', '/', '/', '/', '/', 'e' ],
  [ 'e', '/', '?', '?', '?', '/', 'e' ],
  [ 'e', '/', '?', '?', '?', '?', '/' ],
  [ '/', '?', '?', '?', '?', '?', '/' ],
  [ 'e', '/', '?', '?', '?', '?', '/' ],
  [ 'e', '/', '?', '?', '?', '/', 'e' ],
  [ 'e', 'e', '/', '/', '/', '/', 'e' ],
]);

export default class GameMap {
  board:MapHex[][];

  constructor() {
    this.board = [];
    this.initializeBoard();
  }

  initializeBoard() {
    const BoardHeight = OriginalTerrain.length;
    const BoardWidth = OriginalTerrain[0].length;
    const tilePile = this.stringToResourcePile(OriginalTiles);
    const numberPile= OriginalNumbers.slice();
    const hexRow:MapHex[] =[];
    for (let y = 0; y < BoardHeight; y++) {
      const isOffset: boolean = y % 2 === 1;
      const row = [];
      const freqRow = [];

      for (let x = 0; x < BoardWidth; x++) {

        //add Hexes to the map
        let hexTerrain = TerrainType.Empty;
        let hexResource:ResourceType|undefined = undefined;
        let hexFrequency:number|undefined = undefined;
        let pullTerrainTile = false;
        switch(OriginalTerrain[y][x]){
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
        if(pullTerrainTile){
          let tileIndex = 0;
          if (tilePile.length>1){
            tileIndex = Math.floor(Math.random() * tilePile.length);
            hexResource = tilePile[tileIndex];
          } else if (tilePile.length===1) hexResource = tilePile[0];
          else 
            throw ErrorEvent;
          tilePile.splice(tileIndex,1)

          let frequencyIndex = Math.floor(Math.random() * numberPile.length);
          if(hexResource!==ResourceType.None){
            hexFrequency = numberPile[frequencyIndex];
            numberPile.splice(frequencyIndex,1);
          }
        }
        const newHex = new MapHex(new HexCoords(x,y),hexTerrain, hexResource,hexFrequency)

        
        hexRow.push(newHex);
      }
      this.board.push(hexRow);
    }

    //add town spots to each hex!

    console.log("BH: "+ BoardHeight + ", BW: " + BoardWidth);
    for (let y = 0; y < BoardHeight; y++) {
      let townRowCounter = 0;
      for (let x = 0; x < BoardWidth; x++) {
        for (let theta = 0; theta<6; theta++){
          console.log("checking row " + y + ", x " + x);
          if(!this.townExists(x,y,theta)){
            console.log("adding town spot at" + x + "," + y + "," + theta);
            (this.board[y][x]).addTown(theta);
            townRowCounter++;
          }
        }
      }
      console.log("added " + townRowCounter +" towns on row " + y);
    }
  }

  townExists(x:number,y:number,theta:number){
    let myVC = new VertexCoords(new HexCoords(x,y),theta)//.normalize();
    if (myVC.coords.y>=OriginalTerrain.length) {
      console.log("aborting at "+ x + "," + y + "," + theta);
      return true;
    }
    if (myVC.coords.x>OriginalTerrain[0].length) {
      console.log("aborting at "+ x + "," + y + "," + theta);
      return true;
    }
    return this.board[y][x].townExists(myVC.direction);
  }

  stringToResourcePile(jsonMap:readonly string[]){
    const resourcePile:ResourceType[] = [];
    for (let i = 0; i<jsonMap.length; i++){
      resourcePile.push(stringToResource(jsonMap[i]));
    }
    return resourcePile;
  }


}