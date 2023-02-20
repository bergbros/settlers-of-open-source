import { AllBuildCosts, AllBuildOptions, BuildOptions } from './buildOptions';
import GameMap from './game-map';
import GamePlayer from './gameplayer';
import { resourceToString } from './terrain-type';
import EdgeCoords from './utils/edge-coords';
import HexCoords, { AllHexDirections } from './utils/hex-coords';
import VertexCoords, { AllVertexDirections } from './utils/vertex-coords';

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

  players: GamePlayer[];

  gamePhase: GamePhase;
  currPlayerIdx: number;
  map: GameMap;
  instructionText: string;
  claimedSettlement:boolean;
  constructor() {
    this.claimedSettlement = false;
    this.players = [new GamePlayer(0, 'Player 1'), new GamePlayer(1, 'Player 2')];
    this.currPlayerIdx = 0;
    this.map = new GameMap();
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.instructionText = 'Game Started! Player 1 place first settlement';
  }

  initializeBoard() {
    this.map.initializeBoard();
    this.claimedSettlement = false;
    this.gamePhase = GamePhase.PlaceSettlement1;
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

  

  displayEmptyTowns(): boolean {
    return this.isLocalPlayerTurn() && !this.claimedSettlement &&
      (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2);
  }

  displayEmptyRoads(): boolean {
    return this.isLocalPlayerTurn() && 
      (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2);
  }

  isLocalPlayerTurn(): boolean {
    return true;
  }

  nextPlayer(){
    this.claimedSettlement = false;
    this.map.updateDisplayRoads();

    if (this.gamePhase===GamePhase.PlaceSettlement1){
      if(this.currPlayerIdx === this.players.length-1) {
        console.log("next PhaseTurn!")
        this.nextPhaseTurn();
      } else {        
        this.currPlayerIdx++;
        this.instructionText = `Player ${this.currPlayerIdx+1} place first settlement & road`;
      }
    }else if (this.gamePhase===GamePhase.PlaceSettlement2){
      if(this.currPlayerIdx === 0) {
        this.nextPhaseTurn();
      } else{
        this.currPlayerIdx--;
        this.instructionText = `Player ${this.currPlayerIdx+1} place second settlement & road`;
      }

    } else {
      // check for win conditions!
      if(this.currPlayerIdx === this.players.length-1) 
        this.currPlayerIdx = 0;
      else
        this.currPlayerIdx++;

      //roll dice
      const diceRoll = Math.floor(Math.random() * 6)+1 + Math.floor(Math.random() * 6)+1;

      //distribute resources
      const hexes = this.map.getFrequency(diceRoll);
      for(const hex of hexes){
        for (const dir of AllVertexDirections){
          const town = this.map.townAt(new VertexCoords(hex.coords,dir));
          if(town && town.player){
            console.log("giving " + town.player.index + ": " + resourceToString(hex.resourceType));
            town.player.addCard(hex.resourceType);
          }
        }
      }

      //later... go to Robber gamephase??      
      
      //let player build if desired/possible
      this.instructionText = `Dice roll was: ${diceRoll}\n Player ${this.currPlayerIdx+1}'s turn!`;
    }

    this.forceUpdate();
  }

  actionViable(action:BuildOptions):boolean{
    return false;
  }

  nextPhaseTurn(){
    if(this.gamePhase===GamePhase.PlaceSettlement1){
      this.gamePhase = GamePhase.PlaceSettlement2;
      this.currPlayerIdx = this.players.length-1;
      this.instructionText = `Player ${this.currPlayerIdx+1} place second settlement & road`;
      return;
    } else if(this.gamePhase===GamePhase.PlaceSettlement2){
      this.gamePhase = GamePhase.MainGameplay;
      this.currPlayerIdx = -1;
      this.nextPlayer();
    }
 
  }

  executeAction(action:BuildOptions){

  }

  onVertexClicked(vertex: VertexCoords) {
    if(this.claimedSettlement) return;
    if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2) {
      console.log('vertex clicked: ' + vertex.toString());
      
      const currPlayer = this.getCurrPlayer();
      const townThere = this.map.townAt(vertex);
      townThere?.claimTown(currPlayer);
      this.claimedSettlement = true;
      this.map.updateDisplayRoads(vertex);
      this.forceUpdate();
    }
  }
  
  onEdgeClicked(edge: EdgeCoords) {
    if(!this.claimedSettlement) return;
    if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2) {
      console.log('edge clicked: ' + edge.toString());
      const currPlayer = this.getCurrPlayer();
      const roadThere = this.map.roadAt(edge);
      roadThere?.claimRoad(currPlayer);
      console.log("claimed road");
      this.nextPlayer();
      console.log("passed to next player");
      this.forceUpdate();
    }
  }
  
  onHexClicked(hex: HexCoords) {

  }

}
