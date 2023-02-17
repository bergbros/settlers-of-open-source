import GameMap from './game-map';
import Player from './player';
import EdgeCoords from './utils/edge-coords';
import HexCoords from './utils/hex-coords';
import VertexCoords from './utils/vertex-coords';

// phases requiring input
export enum GamePhase {
  PlaceSettlement1,
  PlaceSettlement2,
  PlaceRobber,
  MainGameplay,
  GameOver,
}

type Action = () => void;

export default class Game {
  forceUpdate: Action = () => { };

  // map
  // players
  // aggregate view of the board
  // Robber
  // longest road, largest army, metropolises
  // deck w/ cards
  // Pieces - roads, settlements etc. Each piece has a ownerIdx pointing to player

  // allPlayerPieces: Map<HexCoords, Piece>
  // refreshObjects()

  players: Player[];

  gamePhase: GamePhase;
  currPlayerIdx: number;
  map: GameMap;
  instructionText: string;

  constructor() {
    this.players = [new Player(0, 'Player 1'), new Player(1, 'Player 2')];
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.currPlayerIdx = 0;
    this.map = new GameMap();
    this.instructionText = 'Game Started! Player 1 place first settlement';
  }

  initializeBoard() {
    this.map.initializeBoard();
  }

  getCurrPlayer() {
    return this.players[this.currPlayerIdx];
  }

  endTurn() {
    if (this.gamePhase === GamePhase.PlaceSettlement2) {
      this.currPlayerIdx--;
      if (this.currPlayerIdx < 0) {
        // move to main gameplay
      }
    }

    this.currPlayerIdx++;
    if (this.currPlayerIdx >= this.players.length) {
      this.currPlayerIdx = 0;
    }
  }

  onHexClicked(hex: HexCoords) {

  }

  onEdgeClicked(edge: EdgeCoords) {

  }

  displayEmptyTowns(): boolean {
    return this.isLocalPlayerTurn() && 
      (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2);
  }

  displayEmptyRoads(): boolean {
    return this.isLocalPlayerTurn() && 
      (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2);
  }

  isLocalPlayerTurn(): boolean {
    return true;
  }

  onVertexClicked(vertex: VertexCoords) {
    if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2) {
      console.log('vertex clicked: ' + vertex.toString());
      
      const currPlayer = this.getCurrPlayer();
      const townThere = this.map.townAt(vertex);
      townThere?.claimTown(currPlayer);
      this.forceUpdate();
    }
  }
}
