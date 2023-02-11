import Player from './player';
import EdgeCoords from './utils/edge-coords';
import HexCoords from './utils/hex-coords';

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

  displayEmptySettlements: boolean;
  displayEmptyRoads: boolean;

  constructor() {

  }

  initializeBoard() {

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
    if (this.gamePhase === GamePhase.PlaceSettlement1) {
      this.getCurrPlayer().placeSettlement(hex);
    }
  }

  onEdgeClicked(edge: EdgeCoords) {

  }

  onVertexClicked(vertex: VertexCoords) {

  }
}
