import { AllBuildCosts, AllBuildOptions, BuildOptions } from './buildOptions';
import GameMap from './game-map';
import GamePlayer from './gameplayer';
import GameTown from './game-town';
import { AllResourceTypes, resourceToString, ResourceType, TerrainType } from './terrain-type';
import EdgeCoords from './utils/edge-coords';
import HexCoords, { AllHexDirections, HexDirection } from './utils/hex-coords';
import VertexCoords, { AllVertexDirections, edgeToVertex, VertexDirection } from './utils/vertex-coords';

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

// roll a 7
// 1. all players discard down to 7 cards
// 2. player choose where to place robber
// 3. player choose which person to rob

export enum RobberPhase {
  ChooseCardsToDiscard,
  PlaceRobber,
  ChooseWhoToRob,
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
  robberLocation: HexCoords;
  robberPhase?: RobberPhase;

  constructor(options: { debugAutoPickSettlements?: boolean }) {
    this.claimedSettlement = false;
    this.players = [
      new GamePlayer(0, 'Player 1'),
      new GamePlayer(1, 'Player 2'),
      new GamePlayer(2, 'Player 3')
    ];

    this.currPlayerIdx = 0;
    this.map = new GameMap();
    this.robberLocation = this.map.robberLocation;
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.instructionText = 'Game Started! Player 1 place first settlement';
    this.displayEmptyTowns();

    // TODO
    if (options.debugAutoPickSettlements) {
      this.autoPickSettlements()
    }
  }

  autoPickSettlements() {
    this.onVertexClicked(new VertexCoords(new HexCoords(3, 2), VertexDirection.N));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(3, 2), HexDirection.NE));

    this.onVertexClicked(new VertexCoords(new HexCoords(5, 2), VertexDirection.NW));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(5, 2), HexDirection.W));

    this.onVertexClicked(new VertexCoords(new HexCoords(5, 4), VertexDirection.N));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(5, 4), HexDirection.NW));

    this.onVertexClicked(new VertexCoords(new HexCoords(3, 4), VertexDirection.N));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(3, 4), HexDirection.NW));

    this.onVertexClicked(new VertexCoords(new HexCoords(2, 3), VertexDirection.N));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(2, 3), HexDirection.NW));

    this.onVertexClicked(new VertexCoords(new HexCoords(4, 5), VertexDirection.N));
    this.onEdgeClicked(new EdgeCoords(new HexCoords(4, 5), HexDirection.NW));

    return;
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

  clearAllDisplaysAndForceUpdate() {
    this.map.resetDisplayRoads();
    this.map.resetDisplayTowns();
    this.forceUpdate();
  }

  isLocalPlayerTurn(): boolean {
    return true;
  }

  nextPlayer() {
    this.claimedSettlement = false;
    this.map.resetDisplayRoads();

    if (this.gamePhase === GamePhase.PlaceSettlement1) {
      if (this.currPlayerIdx === this.players.length - 1) {
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx++;
        this.map.resetDisplayRoads();
        this.displayEmptyTowns();
        this.instructionText = `${this.getCurrPlayer().name} place first settlement & road`;
      }
    } else if (this.gamePhase === GamePhase.PlaceSettlement2) {
      if (this.currPlayerIdx === 0) {
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx--;
        this.map.resetDisplayRoads();
        this.displayEmptyTowns();
        this.instructionText = `${this.getCurrPlayer().name} place second settlement & road`;
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

  endGame(maxPoints: number) {
    const winningPlayers: GamePlayer[] = [];
    for (const plyr of this.players) {
      if (plyr.victoryPoints === maxPoints)
        winningPlayers.push(plyr);
    }
    if (winningPlayers.length === 0) {
      throw new Error(`Couldn't find winning players with ${maxPoints} points?!?`);
    }

    if (winningPlayers.length === 1)
      this.instructionText = `Game Over! Player ${winningPlayers[0].index + 1} wins!`;
    else {
      let winners = "";
      for (const plyr of winningPlayers)
        winners = winners + ", " + plyr.index + 1;
      winners = winners.substring(2);
      this.instructionText = `Game Over! Tie between players: ${winners}!`;
    }
  }

  closeTradeWindow() {
    this.gamePhase = GamePhase.MainGameplay;
  }

  nextPlayerMainGameplay() {
    // check for win conditions!
    const maxPoints = this.calculateVictoryPoints();
    if (maxPoints > 3) {
      this.gamePhase = GamePhase.GameOver;
      this.endGame(maxPoints);
      return;
    }

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
    if (diceRoll === 7) {
      this.gamePhase = GamePhase.PlaceRobber;

      // this.robberPhase = RobberPhase.ChooseCardsToDiscard;
      // Stand-in -- Discard down to 3
      for (const plyr of this.players) {
        for (const res of AllResourceTypes) {
          if (plyr.cards[res] > 3) {
            console.log(`Player ${plyr.index + 1} lost ${resourceToString(res)}`)
            plyr.cards[res] = 3;
          }
        }
      }

      this.robberPhase = RobberPhase.PlaceRobber;

      this.instructionText = `Dice roll was: ${diceRoll} - ${this.getCurrPlayer().name} place the Robber!`;
    }
    else {
      //let player build if desired/possible
      this.instructionText = `Dice roll was: ${diceRoll}\n ${this.getCurrPlayer().name}'s turn!`;
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
      this.instructionText = `${this.getCurrPlayer().name} place second settlement & road`;
      return;

    } else if (this.gamePhase === GamePhase.PlaceSettlement2) {
      this.gamePhase = GamePhase.MainGameplay;
      this.currPlayerIdx = -1;
      this.nextPlayer();
    }

  }

  calculateVictoryPoints(): number {
    let maxPoints = 0;
    for (const plyr of this.players) {
      plyr.victoryPoints = 0;
      for (const twn of this.map.towns) {
        if (twn.player === plyr)
          plyr.victoryPoints += twn.townLevel;
      }
      if (plyr.victoryPoints > maxPoints)
        maxPoints = plyr.victoryPoints;
    }
    return maxPoints;
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

    if (this.gamePhase === GamePhase.PlaceSettlement1
      || this.gamePhase === GamePhase.PlaceSettlement2
      || this.gamePhase === GamePhase.BuildSettlement) {

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

    } else if (this.gamePhase === GamePhase.BuildCity && townThere?.highlighted) {
      townThere.upgradeCity();
      this.gamePhase = GamePhase.MainGameplay;
      currPlayer.spend(AllBuildCosts[BuildOptions.City]);
      this.map.resetDisplayTowns();

    } else if (this.gamePhase === GamePhase.PlaceRobber
      && this.robberPhase === RobberPhase.ChooseWhoToRob
      && townThere?.player
      && townThere?.player !== this.getCurrPlayer()) {

      this.stealResourceFromPlayer(townThere.player);
    }

    this.forceUpdate();
  }

  onEdgeClicked(edge: EdgeCoords) {
    if (!this.claimedSettlement && (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2))
      return;
    if (this.gamePhase !== GamePhase.BuildRoad && this.gamePhase !== GamePhase.PlaceSettlement1 && this.gamePhase !== GamePhase.PlaceSettlement2)
      return;

    const currPlayer = this.getCurrPlayer();
    const roadThere = this.map.roadAt(edge);
    roadThere?.claimRoad(currPlayer);
    if (this.gamePhase == GamePhase.BuildRoad) currPlayer.spend(AllBuildCosts[BuildOptions.Road]);
    this.nextPlayer();
    this.forceUpdate();
  }

  onHexClicked(coords: HexCoords) {
    //useful for when we place the robber!
    if (this.gamePhase === GamePhase.PlaceRobber && this.robberPhase === RobberPhase.PlaceRobber) {
      this.onHexClicked_PlaceRobber(coords);
    }
  }

  onHexClicked_PlaceRobber(coords: HexCoords) {
    const clickedHex = this.map.getHex(coords);

    if (clickedHex?.terrainType !== TerrainType.Land) {
      return;
    }

    this.robberLocation = coords;

    // Choose who to steal from
    const robbablePlayers: GamePlayer[] = [];
    for (const dir of AllVertexDirections) {
      const town = this.map.townAt(new VertexCoords(clickedHex.coords, dir));
      if (town && town.player && town.player !== this.getCurrPlayer()) {
        // Highlight town for player choosing who to steal from
        town.highlightMe();

        if (!robbablePlayers.includes(town.player)) robbablePlayers.push(town.player);
      }
    }

    if (robbablePlayers.length === 0) {
      // no one to steal from
      this.robberPhase = undefined;
      this.gamePhase = GamePhase.MainGameplay;
      this.instructionText =
        `${this.getCurrPlayer().name} placed the robber, but there was no one to steal from.
         ${this.getCurrPlayer().name}'s turn!`;
      this.clearAllDisplaysAndForceUpdate();
      return;
    }

    // Check if there's more than 1 player to rob
    if (robbablePlayers.length === 1) {
      // Only 1 player to rob, rob them automatically
      console.log("robbing one player: " + robbablePlayers[0].index);
      this.stealResourceFromPlayer(robbablePlayers[0]);
      this.clearAllDisplaysAndForceUpdate();
      return;
    }

    this.instructionText = `${this.getCurrPlayer().name} choose who to rob!`;
    this.robberPhase = RobberPhase.ChooseWhoToRob;
    this.forceUpdate();
  }

  stealResourceFromPlayer(robbedPlayer: GamePlayer) {
    const availableResources = robbedPlayer.currentResources();
    if (availableResources.length === 0) {
      this.instructionText =
        `${this.getCurrPlayer().name} tried to rob from Player ${robbedPlayer.index + 1} but they had no resources ---
         ${this.getCurrPlayer().name}'s turn!`;

    } else {

      const stolenResource = Math.floor(Math.random() * availableResources.length);
      robbedPlayer.lose(availableResources[stolenResource]);
      this.getCurrPlayer().addCard(availableResources[stolenResource]);

      this.instructionText =
        `${this.getCurrPlayer().name} stole ${resourceToString(availableResources[stolenResource])} from Player ${robbedPlayer.index + 1} ---
      ${this.getCurrPlayer().name}'s turn!`;
    }

    this.gamePhase = GamePhase.MainGameplay;
    this.robberPhase = undefined;
    this.clearAllDisplaysAndForceUpdate();
  }
}
