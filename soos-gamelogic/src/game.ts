import { AllBuildCosts, AllBuildOptions, BuildOptions } from './buildOptions';
import GameMap from './game-map';
import GamePlayer from './gameplayer';
import { AllResourceTypes, resourceToString, ResourceType } from './terrain-type';
import EdgeCoords from './utils/edge-coords';
import HexCoords, { AllHexDirections } from './utils/hex-coords';
import VertexCoords, { AllVertexDirections, edgeToVertex } from './utils/vertex-coords';

// phases requiring input
export enum GamePhase {
  PlaceSettlement1,
  PlaceSettlement2,
  PlaceRobber,
  MainGameplay,
  BuildRoad,
  BuildSettlement,
  BuildCity,
  BuyDevelopmentCard,
  TradeResources,
  GameOver,
}

type Action = () => void;

export default class Game {
  forceUpdate: Action = () => { };

  // aggregate view of the board
  // Robber
  // longest road, largest army, metropolises
  // deck w/ cards
  // Pieces - roads, settlements etc. Each piece has a ownerIdx pointing to player

  // allPlayerPieces: Map<HexCoords, Piece>

  players: GamePlayer[];

  gamePhase: GamePhase;
  currPlayerIdx: number;
  map: GameMap;
  instructionText: string;
  claimedSettlement: boolean; //only applicable during gamephase.placeSettlement 1&2, if false player is placing settlement, if true they are placing a road.
  robberLocation:HexCoords;

  constructor() {
    this.claimedSettlement = false;
    this.players = [new GamePlayer(0, 'Player 1'), new GamePlayer(1, 'Player 2')];
    this.currPlayerIdx = 0;
    this.map = new GameMap();
    this.robberLocation = this.map.robberLocation;
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.instructionText = 'Game Started! Player 1 place first settlement';
    this.displayEmptyTowns();
  }

  //this never gets called at the moment
  initializeBoard() {
    console.log("initializing board");
    this.map.initializeBoard();
    this.claimedSettlement = false;
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.displayEmptyTowns();
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


  displayEmptyTowns() {
    for (const town of this.map.towns)
      town.showMe();
  }

  displayEmptyRoads() {
    //do we ever want to show all empty roads? not sure we need this function
    for (const road of this.map.roads)
      road.showMe();
  }

  isLocalPlayerTurn(): boolean {
    return true;
  }

  nextPlayer() {
    this.claimedSettlement = false;
    this.map.resetDisplayRoads();

    if (this.gamePhase === GamePhase.PlaceSettlement1) {
      if (this.currPlayerIdx === this.players.length - 1) {
        console.log("next PhaseTurn!")
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx++;
        this.map.resetDisplayRoads();
        this.displayEmptyTowns();
        this.instructionText = `Player ${this.currPlayerIdx + 1} place first settlement & road`;
      }
    } else if (this.gamePhase === GamePhase.PlaceSettlement2) {
      if (this.currPlayerIdx === 0) {
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx--;
        this.map.resetDisplayRoads();
        this.displayEmptyTowns();
        this.instructionText = `Player ${this.currPlayerIdx + 1} place second settlement & road`;
      }

    } else if (this.gamePhase === GamePhase.MainGameplay) {
      this.nextPlayerMainGameplay();
    } else if (this.gamePhase === GamePhase.BuildSettlement) {
      this.gamePhase = GamePhase.MainGameplay;
    } else if (this.gamePhase === GamePhase.BuildRoad) {
      this.gamePhase = GamePhase.MainGameplay;
    }

    this.forceUpdate();
  }



  nextPlayerMainGameplay() {
    // check for win conditions!

    //next player
    if (this.currPlayerIdx === this.players.length - 1)
      this.currPlayerIdx = 0;
    else
      this.currPlayerIdx++;

    //roll dice
    const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

    //distribute resources
    const hexes = this.map.getFrequency(diceRoll);
    for (const hex of hexes) {
      for (const dir of AllVertexDirections) {
        const town = this.map.townAt(new VertexCoords(hex.coords, dir));
        if (town && town.player) {
          town.player.addCard(hex.resourceType, town.townLevel);
        }
      }
    }

    //go to Robber gamephase!      
    if(diceRoll===7){
      this.gamePhase=GamePhase.PlaceRobber;
      
      for(const plyr of this.players){
        for(const res of AllResourceTypes){
          if(plyr.cards[res]>3){
            console.log(`Player ${plyr.index + 1} lost ${resourceToString(res)}`)
            plyr.cards[res]=3;
          }
        }
      }

      this.instructionText = `Dice roll was: ${diceRoll} - Player ${this.currPlayerIdx + 1} place the Robber!`;
    }
    else {
      //let player build if desired/possible
      this.instructionText = `Dice roll was: ${diceRoll}\n Player ${this.currPlayerIdx + 1}'s turn!`;
    }
    this.forceUpdate();
  }



  actionViable(action: BuildOptions): boolean {
    //negative cost indicates any one resource less than requirement is an option
    //TODO: implement ports eventually...
    let defaultReturnValue = true;
    for (const resource of AllResourceTypes) {

      if (AllBuildCosts[action][resource] < 0) {
        defaultReturnValue = false;
        if (this.players[this.currPlayerIdx].cards[resource] >= -1 * AllBuildCosts[action][resource]) {
          return true;
        }
      } else {
        if (this.players[this.currPlayerIdx].cards[resource] < AllBuildCosts[action][resource]) {
          return false;
        }
      }
    }
    return defaultReturnValue;
  }

  nextPhaseTurn() {
    if (this.gamePhase === GamePhase.PlaceSettlement1) {
      this.gamePhase = GamePhase.PlaceSettlement2;
      this.currPlayerIdx = this.players.length - 1;
      this.map.resetDisplayRoads();
      this.displayEmptyTowns();
      this.instructionText = `Player ${this.currPlayerIdx + 1} place second settlement & road`;
      return;

    } else if (this.gamePhase === GamePhase.PlaceSettlement2) {
      this.gamePhase = GamePhase.MainGameplay;
      this.currPlayerIdx = -1;
      this.nextPlayer();
    }

  }

  executeAction(action: BuildOptions) {
    switch (action) {
      case BuildOptions.Road:
        this.gamePhase = GamePhase.BuildRoad;
        this.map.resetDisplayRoads();
        for (const road of this.map.roads) {
          if (!road.player) 
            continue;
          if (road.player?.index !== this.currPlayerIdx) 
            continue;
          this.map.updateDisplayRoads(new VertexCoords(road.coords.hexCoords, edgeToVertex(road.coords.direction)));
          this.map.updateDisplayRoads(new VertexCoords(road.coords.hexCoords, edgeToVertex((road.coords.direction + 1) % 6)));
        }
        break;
      case BuildOptions.Settlement:
        this.claimedSettlement = false;
        this.gamePhase = GamePhase.BuildSettlement;
        this.map.resetDisplayRoads();
        this.map.resetDisplayTowns();
        for (const road of this.map.roads) {
          if (!road.player) 
            continue;
          if (road.player?.index !== this.currPlayerIdx) 
            continue;
          for (const town of this.map.getTowns(road))
            town.showMe();
        }
        break;
      case BuildOptions.City:
        for (const town of this.map.towns) {
          if (town.isUnclaimed()) 
            continue;
          if (town.player === this.players[this.currPlayerIdx])
            town.highlightMe();
        }
        this.claimedSettlement = false;
        this.gamePhase = GamePhase.BuildCity;
        break;
      case BuildOptions.Development:

        break;
      case BuildOptions.Trade:
        break;
    }
    this.forceUpdate();
  }

  onVertexClicked(vertex: VertexCoords) {
    if (this.claimedSettlement) 
      return;
    const currPlayer = this.getCurrPlayer();
    const townThere = this.map.townAt(vertex);

    if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2 || this.gamePhase === GamePhase.BuildSettlement) {
      townThere?.claimTown(currPlayer);
      this.map.resetDisplayRoads();
      this.map.resetDisplayTowns();
      if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2) {
        this.claimedSettlement = true;
        this.map.updateDisplayRoads(vertex);
      } else {
        currPlayer.spend(AllBuildCosts[BuildOptions.Settlement]);
        this.gamePhase = GamePhase.MainGameplay;
      }
    } else if (this.gamePhase === GamePhase.BuildCity) {
      if (townThere) {
        if (townThere.highlighted) {
          townThere.upgradeCity();
          this.gamePhase = GamePhase.MainGameplay;
          currPlayer.spend(AllBuildCosts[BuildOptions.City]);
          this.map.resetDisplayTowns();
        }
      }
    }
    this.forceUpdate();
  }

  onEdgeClicked(edge: EdgeCoords) {
    if (!this.claimedSettlement && (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2)) 
      return;
    if (this.gamePhase !== GamePhase.BuildRoad && this.gamePhase !== GamePhase.PlaceSettlement1 && this.gamePhase !== GamePhase.PlaceSettlement2) 
      return;

    //console.log('edge clicked: ' + edge.toString());
    const currPlayer = this.getCurrPlayer();
    const roadThere = this.map.roadAt(edge);
    roadThere?.claimRoad(currPlayer);
    if (this.gamePhase == GamePhase.BuildRoad) currPlayer.spend(AllBuildCosts[BuildOptions.Road]);
    this.nextPlayer();
    this.forceUpdate();
  }

  onHexClicked(coords: HexCoords) {
    //useful for when we place the robber!
    if(this.gamePhase===GamePhase.PlaceRobber){
      const clickedHex = this.map.getHex(coords);
      if(clickedHex?.resourceType!==undefined && clickedHex.resourceType!==ResourceType.None){
        this.robberLocation= coords;
        //steal a resource from a random player:
        let robbedPlayer:(GamePlayer|undefined) = undefined;
        let dir:number = Math.floor(Math.random() * 6);
        let origDir =dir;
        
        do {
          robbedPlayer = this.map.townAt(new VertexCoords(coords,dir))?.player;
          if (robbedPlayer === this.players[this.currPlayerIdx]) 
            robbedPlayer=undefined;

          dir++;
        } while (robbedPlayer===undefined && dir<origDir+6)
        if(robbedPlayer){
          const availableResources = robbedPlayer.currentResources();
          const stolenResource = Math.floor(Math.random() * availableResources.length);
          robbedPlayer.lose(availableResources[stolenResource]);
          this.players[this.currPlayerIdx].addCard(availableResources[stolenResource]);
          this.instructionText = 
            `Player ${this.currPlayerIdx + 1} stole ${resourceToString(availableResources[stolenResource])} from Player ${robbedPlayer.index + 1} ---
            Player ${this.currPlayerIdx + 1}'s turn!`;
          
          } else {
            this.instructionText = 
            `Player ${this.currPlayerIdx + 1} placed the robber ---
            Player ${this.currPlayerIdx + 1}'s turn!`;
          

          }
        this.gamePhase = GamePhase.MainGameplay;
        this.map.resetDisplayRoads();
        this.map.resetDisplayTowns();
        this.forceUpdate();
      }
    }
  }

}
