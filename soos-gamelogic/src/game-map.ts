import MapHex from './map-hex';

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
  board: MapHex[][];

  constructor() {
    this.board = [];
    this.initializeBoard();
  }

  initializeBoard() {

  }
}