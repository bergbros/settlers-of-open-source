import { AllBuildCosts, AllBuildActionTypes, BuildAction, BuildCityAction, BuildActionType, BuildRoadAction, BuildSettlementAction, CompletedBuildAction, NullBuildAction, hydrateBuildAction } from './build-actions.js';
import GameMap from './game-map.js';
import GamePlayer from './game-player.js';
import GameTown from './game-town.js';
import { AllResourceTypes, resourceToString, ResourceType, TerrainType } from './terrain-type.js';
import EdgeCoords from './utils/edge-coords.js';
import HexCoords, { AllHexDirections, HexDirection, hydrateHexCoords } from './utils/hex-coords.js';
import VertexCoords, { AllVertexDirections, edgeToVertex, getEdges, getHexes, VertexDirection } from './utils/vertex-coords.js';

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
  robberHexes: HexCoords[];
  turnNumber: number;
  premoveActions: BuildAction[];

  constructor(options: { debugAutoPickSettlements?: boolean }) {
    this.turnNumber = 0;
    this.claimedSettlement = false;
    this.players = [
      new GamePlayer(0, 'Player 1'),
      new GamePlayer(1, 'Player 2'),
      // new GamePlayer(2, 'Player 3')
    ];

    this.currPlayerIdx = 0;
    this.map = new GameMap();
    this.robberLocation = this.map.robberLocation;
    this.gamePhase = GamePhase.PlaceSettlement1;
    this.instructionText = 'Game Started! Player 1 place first settlement.js';
    this.displayEmptyTowns();
    this.robberHexes = [];
    this.premoveActions = [];
    // if (options.debugAutoPickSettlements) {
    //   this.autoPickSettlements()
    // }
  }

  setupPhase(): boolean {
    return this.gamePhase == GamePhase.PlaceSettlement1 || this.gamePhase == GamePhase.PlaceSettlement2;
  }

  autoPickSettlements() {
    //evaluate all possible towns by production, get the top 4
    let bestTown: GameTown = this.map.towns[0];
    console.log('picking settlements!');
    const playerProduction: number[][] = [];
    for (let i = 0; i < 4; i++) {
      //FIND & CLAIM THE BEST TOWN
      bestTown = this.map.towns[0];
      let bestProd = 0;
      for (const town of this.map.towns) {
        if (town.isUnclaimed()) {
          const newProd = this.evaluateTown(town);
          if (newProd > bestProd) {
            bestTown = town;
            bestProd = newProd;
          }
        }
      }
      if (!bestTown.coords) {
        throw new Error('Undefined coords on best town??');
      }
      console.log('Claimed town: ' + bestTown.coords?.toString() + ' prod: ' + bestTown.production);
      //this.evaluateTown(bestTown, true);
      this.onClientVertex(bestTown.coords, this.currPlayerIdx);

      const roads = this.map.getRoads(bestTown.coords);
      let weClaimedARoad = false;
      for (let jj = 0; jj < roads.length; jj++) {
        console.log('road ' + roads[jj]?.coords.toString() + ' : ' + roads[jj]?.isClaimed());
        if (!roads[jj]?.isClaimed()) {
          this.onEdgeClicked(getEdges(bestTown.coords)[0]);
          console.log('claimed road: ' + roads[jj]?.coords.toString());
          weClaimedARoad = true;
          break;
        }
      }
      if (!weClaimedARoad) {
        throw new Error('uh... we didn\'t claim a road...??');
      }
    }
    //this.nextPlayer();
    return;
  }

  evaluateTown(newTown: GameTown, log = false): number {
    let prodScore = 0;
    const tradeBenefit: number[] = [];
    const potentialNewProduction: number[] = [];
    const currPlayer = this.players[this.currPlayerIdx];
    for (const resource of AllResourceTypes) {
      prodScore += newTown.production[resource] * ((currPlayer.tradeRatio[resource] - 4) / 3 + 1);
      potentialNewProduction.push(currPlayer.resourceProduction[resource] + newTown.production[resource]);
      tradeBenefit.push(0);
    }
    if (!newTown.coords) {
      throw new Error('evaluated town has no coords??');
    }

    let tradeScore = 0;
    for (const coords of getHexes(newTown.coords)) {
      if (this.map.getHex(coords)?.getTrade() === 1) {
        const newTR = this.getTradeRatios(coords);
        for (const resource of AllResourceTypes) {
          if (!newTR) {
            continue;
          }
          tradeBenefit[resource] = Math.max(0, currPlayer.tradeRatio[resource] - newTR[resource]) * (potentialNewProduction[resource] + .5);
        }
        //console.log("port: ");
        //console.log(tradeBenefit);
      }
    }
    for (const resource of AllResourceTypes) {
      tradeScore += tradeBenefit[resource];
    }
    if (log) {
      console.log(potentialNewProduction);
      console.log(tradeBenefit);
    }
    newTown.eval = prodScore + tradeScore / 8;
    return newTown.eval;
  }

  //this never gets called at the moment
  initializeBoard() {
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
    for (const town of this.map.towns) {
      town.showMe();
    }
  }

  displayEmptyRoads() {
    //do we ever want to show all empty roads? not sure we need this function
    for (const road of this.map.roads) {
      road.showMe();
    }
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
    //TODO: Check if any premoves can be executed
    this.executePremoves();
    this.forceUpdate();
  }

  endGame(maxPoints: number) {
    const winningPlayers: GamePlayer[] = [];
    for (const plyr of this.players) {
      if (plyr.victoryPoints === maxPoints) {
        winningPlayers.push(plyr);
      }
    }
    if (winningPlayers.length === 0) {
      throw new Error(`Couldn't find winning players with ${maxPoints} points?!?`);
    }

    if (winningPlayers.length === 1) {
      this.instructionText = `Game Over! Player ${winningPlayers[0].index + 1} wins!`;
    } else {
      let winners = '';
      for (const plyr of winningPlayers) {
        winners = winners + ', ' + plyr.index + 1;
      }
      winners = winners.substring(2);
      this.instructionText = `Game Over! Tie between players: ${winners}!`;
    }
  }

  closeTradeWindow() {
    this.gamePhase = GamePhase.MainGameplay;
  }

  // serialize() {
  //
  // }
  // redux
  //
  //
  // JSON.parse
  // new Game()
  // foreach (pl)
  // new player
  // hydrate

  nextPlayerMainGameplay() {
    // check for win conditions!
    const maxPoints = this.calculateVictoryPoints();
    if (maxPoints > 3) {
      this.gamePhase = GamePhase.GameOver;
      this.endGame(maxPoints);
      return;
    }

    //next player
    if (this.currPlayerIdx === this.players.length - 1) {
      this.currPlayerIdx = 0;
      this.turnNumber++;
    } else {
      this.currPlayerIdx++;
    }

    //roll dice
    const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

    //distribute resources
    const hexes = this.map.getFrequency(diceRoll);
    for (const hex of hexes) {
      for (const dir of AllVertexDirections) {
        const town = this.map.townAt(new VertexCoords(hex.coords, dir));
        if (town && town.playerIdx !== undefined) {
          this.players[town.playerIdx].addCard(hex.resourceType, town.townLevel);
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
          if (plyr.cards[res] > 5) {
            plyr.cards[res] = 5;
          }
        }
      }
      //MANUAL robber placement:
      //this.robberPhase = RobberPhase.PlaceRobber;
      //this.instructionText = `Dice roll was: ${diceRoll} - ${this.getCurrPlayer().name} place the Robber!`;

      //AUTOMATIC robber placement
      if (this.robberHexes.length < 1) {
        this.onHexClicked_PlaceRobber(this.robberLocation, true);
      } else {
        const newRobHexIndex = Math.floor(Math.random() * this.robberHexes.length);
        if (this.robberHexes[newRobHexIndex] === undefined) {
          throw new Error('undefined robber hex!');
        }
        this.onHexClicked_PlaceRobber(this.robberHexes[newRobHexIndex], true);
      }
      this.gamePhase = GamePhase.MainGameplay;


    } else {
      //let player build if desired/possible
      this.instructionText = `Dice roll was: ${diceRoll}\n ${this.getCurrPlayer().name}'s turn!`;
    }
    this.forceUpdate();
  }

  actionViable(action: BuildActionType): boolean {
    //negative cost indicates any one resource less than requirement is an option
    //TODO: implement ports eventually...
    let defaultReturnValue = true;
    for (const resource of AllResourceTypes) {

      if (AllBuildCosts[action][resource] < 0) {
        //negative cost: any single resource is enough to make the action viable (e.g. trade)
        defaultReturnValue = false;
        if (this.players[this.currPlayerIdx].cards[resource] >= -1 * AllBuildCosts[action][resource]) {
          return true;
        }
      } else {
        // positive cost, all resources must be present
        //if any one resource is not present, action is not viable
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
        if (twn.playerIdx === plyr.index) {
          plyr.victoryPoints += twn.townLevel;
        }
      }
      //console.log("player " + plyr.index + " has " + plyr.victoryPoints + " victory points")
      if (plyr.victoryPoints > maxPoints) {
        maxPoints = plyr.victoryPoints;
      }
    }
    return maxPoints;
  }

  executeTrade(tradeInResource: number, tradeForResource: number, playerId: number) {
    const player = this.players[playerId];
    if (player.cards[tradeInResource] >= player.tradeRatio[tradeInResource]) {
      const cost = [0, 0, 0, 0, 0];
      cost[tradeInResource] = player.tradeRatio[tradeInResource];
      console.log('executing trade:' + cost);
      player.spend(cost);
      player.addCard(AllResourceTypes[tradeForResource]);
    }
    this.forceUpdate();
  }

  displayActionOptions(action: BuildActionType) {
    switch (action) {
      case BuildActionType.Road:
        this.gamePhase = GamePhase.BuildRoad;
        this.map.resetDisplayRoads();
        for (const road of this.map.roads) {
          if (!road.player) {
            continue;
          }
          if (road.player?.index !== this.currPlayerIdx) {
            continue;
          }
          this.map.updateDisplayRoads(new VertexCoords(road.coords.hexCoords, edgeToVertex(road.coords.direction)));
          this.map.updateDisplayRoads(new VertexCoords(road.coords.hexCoords, edgeToVertex((road.coords.direction + 1) % 6)));
        }
        break;
      case BuildActionType.Settlement:
        this.claimedSettlement = false;
        this.gamePhase = GamePhase.BuildSettlement;
        this.map.resetDisplayRoads();
        this.map.resetDisplayTowns();
        for (const road of this.map.roads) {
          if (!road.player) {
            continue;
          }
          if (road.player?.index !== this.currPlayerIdx) {
            continue;
          }
          for (const town of this.map.getTowns(road)) {
            town.showMe();
          }
        }
        break;
      case BuildActionType.City:
        for (const town of this.map.towns) {
          if (town.isUnclaimed()) {
            continue;
          }
          if (town.playerIdx === this.currPlayerIdx) {
            town.highlightMe();
          }
        }
        this.claimedSettlement = false;
        this.gamePhase = GamePhase.BuildCity;
        break;
      case BuildActionType.Development:

        break;

    }
    this.forceUpdate();
  }

  onClientVertex(vertex: VertexCoords, playerID: number, premove: boolean = false): BuildAction {
    const town = this.map.townAt(vertex);
    if (town === undefined) {
      return new NullBuildAction();
    }

    let buildAction = this.getBuildActionTown(town, playerID);
    if (!this.setupPhase()) {
      console.log("main game: returning BuildAction");
      return buildAction;
    }

    // Specifics for game setup phase!
    if (this.currPlayerIdx !== playerID || this.claimedSettlement) return new NullBuildAction();
    console.log("Executing action:");
    console.log(buildAction);
    const success = buildAction.execute(this);
    if (success) {
      console.log("it worked");
      //next player
      this.claimedSettlement = true;
      if (this.gamePhase === GamePhase.PlaceSettlement2) {
        const currPlayer = this.players[this.currPlayerIdx];
        for (const coords of getHexes(vertex)) {
          currPlayer.addCard(this.map.getHex(coords)?.resourceType, 1);
        }
      }
      this.map.updateDisplayRoads(vertex);
      return new CompletedBuildAction();
    } else {
      console.log("it failed");
      return new NullBuildAction();
    }

  }

  getBuildActionTown(town: GameTown, playerID: number, premove: boolean = false) {
    if (town.playerIdx !== undefined && town.playerIdx !== playerID) return new NullBuildAction();
    if (town.coords === undefined) return new NullBuildAction();

    let returnAction: BuildAction;
    console.log("making BuildTownAction:");
    if (!town.isUnclaimed() || this.settlePremovePresent(town.coords, playerID))
      returnAction = new BuildCityAction(playerID, town.coords);
    else
      returnAction = new BuildSettlementAction(playerID, town.coords);
    console.log(returnAction);
    //only return valid actions!
    if (returnAction.shouldDisqualify(this)) {//Why is this true during setup?
      console.log("Action Disqualified");
      return new NullBuildAction();
    }
    else
      return returnAction;
  }

  settlePremovePresent(location: VertexCoords, playerId: number): boolean {
    if (!this.map.townAt(location)?.isUnclaimed()) return false;
    for (const playerPremove of this.getPremoves(playerId)) {
      if (playerPremove.type !== BuildActionType.Settlement) continue;
      if (playerPremove.location !== location) continue;
      return true;
    }
    return false;
  }

  addPremove(buildActionJSON: BuildAction) {
    const buildAction = hydrateBuildAction(buildActionJSON);
    console.log(buildAction.displayString());
    // check if the action is already present in the premoves
    for (let action of this.premoveActions) {
      if (action.equals(buildAction)) {
        return;
      }
    }
    if (buildAction.shouldDisqualify(this) === false) {
      this.premoveActions.push(buildAction);
    }
  }


  executePremoves() {
    let playerIndex = this.currPlayerIdx;
    let loopBreaker = 0;
    do {
      const currentPremoves = this.getPremoves(playerIndex);
      for (const action of currentPremoves) {
        if (action.isPossible(this)) action.execute(this);
      }
      playerIndex++;
      if (playerIndex >= this.players.length)
        playerIndex = 0;
      loopBreaker++;
      if (loopBreaker > this.players.length + 1) {
        console.log("Infinite loop detected! Emergency measures deployed!");
        return;
      }
    } while (playerIndex !== this.currPlayerIdx)

    return;
  }


  onClientEdge(edge: EdgeCoords, playerID: number, premove: boolean = false): BuildAction {
    console.log('on client edge');
    if (this.setupPhase()) {
      console.log('set up phase');
      if (!this.claimedSettlement) {
        return new NullBuildAction();
      }

      if (this.onEdgeClicked(edge)) {      //setup phase build road code
        return new CompletedBuildAction();
      } else {
        return new NullBuildAction();
      }

    } else {
      if (this.gamePhase !== GamePhase.BuildRoad && !premove) {
        return new NullBuildAction();
      } else if (this.gamePhase === GamePhase.BuildRoad && this.onEdgeClicked(edge)) {
        return new CompletedBuildAction();
      } else {
        this.gamePhase = GamePhase.MainGameplay;
        return new BuildRoadAction(playerID, edge);
      }
    }
  }

  onEdgeClicked(edge: EdgeCoords): boolean {
    if (!this.claimedSettlement && (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2)) {
      return false;
    }
    if (this.gamePhase !== GamePhase.BuildRoad && this.gamePhase !== GamePhase.PlaceSettlement1 && this.gamePhase !== GamePhase.PlaceSettlement2) {
      return false;
    }

    const currPlayer = this.getCurrPlayer();
    const roadThere = this.map.roadAt(edge);
    roadThere?.claimRoad(currPlayer);
    if (this.gamePhase === GamePhase.BuildRoad) {
      currPlayer.spend(AllBuildCosts[BuildActionType.Road]);
    }
    this.nextPlayer();
    this.forceUpdate();
    return true;
  }

  getPremoves(playerId: number) {
    const playerMoves: BuildAction[] = [];
    for (const move of this.premoveActions) {
      if (move.playerId === playerId) {
        playerMoves.push(move);
      }
    }
    //console.log("Player " + playerId + " Premoves:");
    //console.log(playerMoves);
    return playerMoves;
  }

  possibleRoadLocationsForPlayer(playerIdx: number): EdgeCoords[] {
    const roadLocations: EdgeCoords[] = [];

    for (const road of this.map.roads) {
      if (road.player?.index !== playerIdx)
        continue;
      roadLocations.push(road.coords);
    }

    return roadLocations;
  }

  // roadLocationsStartingAtVertex(road: GameRoad): EdgeCoords[] {
  //   const roads = this.map.getRoads(new VertexCoords(road.coords.hexCoords, edgeToVertex(road.coords.direction)));
  // }

  onHexClicked(coords: HexCoords): boolean {
    //useful for when we place the robber!
    if (this.gamePhase === GamePhase.PlaceRobber && this.robberPhase === RobberPhase.PlaceRobber) {
      this.onHexClicked_PlaceRobber(coords);
      return true;
    }
    return false;
  }

  onHexClicked_PlaceRobber(coords: HexCoords, automate?: boolean) {
    const clickedHex = this.map.getHex(coords);

    if (clickedHex?.terrainType !== TerrainType.Land) {
      return;
    }

    this.robberLocation = coords;

    // Choose who to steal from
    const robbablePlayers: number[] = [];
    for (const dir of AllVertexDirections) {
      const town = this.map.townAt(new VertexCoords(clickedHex.coords, dir));
      if (town && town.playerIdx !== undefined && town.playerIdx !== this.currPlayerIdx) {
        // Highlight town for player choosing who to steal from
        town.highlightMe();

        if (!robbablePlayers.includes(town.playerIdx)) {
          robbablePlayers.push(town.playerIdx);
        }
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

    // Check if there's more than 1 player to rob or automatically pick a player to rob
    if (robbablePlayers.length === 1 || automate) {
      // Only 1 player to rob, rob them automatically
      const randPlayer = Math.floor(Math.random() * robbablePlayers.length);
      this.stealResourceFromPlayer(robbablePlayers[randPlayer]);
      this.clearAllDisplaysAndForceUpdate();
      return;
    }

    this.instructionText = `${this.getCurrPlayer().name} choose who to rob!`;
    this.robberPhase = RobberPhase.ChooseWhoToRob;
    this.forceUpdate();
  }

  stealResourceFromPlayer(robbedPlayerIdx: number) {
    const robbedPlayer = this.players[robbedPlayerIdx];
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

  toString() {
    return JSON.stringify(this);
  }

  setChildPrototypes() {
    this.map = Object.assign(new GameMap(), this.map);
    this.map.setChildPrototypes();

    for (let i = 0; i < this.players.length; i++) {
      this.players[i] = Object.assign(new GamePlayer(i, this.players[i].name), this.players[i]);
      this.players[i].setChildPrototypes();
    }

    this.robberLocation = hydrateHexCoords(this.robberLocation);

    for (let i = 0; i < this.premoveActions.length; i++) {
      if (this.premoveActions[i].type === BuildActionType.Road) {
        const action = this.premoveActions[i] as BuildRoadAction;
        this.premoveActions[i] = new BuildRoadAction(action.playerId, action.location);
        this.premoveActions[i].setChildPrototypes();
      }
    }
  }

  updatePlayerTradeRatios(townThere: GameTown | undefined) {
    if (!townThere) {
      return;
    }
    if (!townThere.coords) {
      return;
    }
    for (const hcoords of getHexes(townThere.coords)) {
      const newRatios = this.getTradeRatios(hcoords);
      if (newRatios) {
        this.setLowerRatio(newRatios);
      }
    }
  }

  updatePlayerProduction(townThere: GameTown | undefined) {
    if (!townThere) {
      return;
    }
    if (!townThere.coords) {
      return;
    }
    for (const resource of AllResourceTypes) {
      this.players[this.currPlayerIdx].resourceProduction[resource] += townThere.production[resource];
    }
  }

  updateRobberHexes(townThere: GameTown | undefined) {
    if (!townThere) {
      return;
    }
    if (!townThere.coords) {
      return;
    }
    for (const hcoords of getHexes(townThere.coords)) {
      const hex = this.map.getHex(hcoords);
      if (hex && this.robberHexes.indexOf(hcoords) === -1) {
        console.log('updated robberhexes!');
        this.robberHexes.push(hcoords);
        console.log(this.robberHexes);
      }
    }
  }

  setLowerRatio(ratio: number[]) {
    for (let i = 0; i < ratio.length; i++) {
      if (this.players[this.currPlayerIdx].tradeRatio[i] > ratio[i]) {
        this.players[this.currPlayerIdx].tradeRatio[i] = ratio[i];
      }
    }
  }

  getTradeRatios(coords: HexCoords) {
    const hex = this.map.getHex(coords);
    if (!hex) {
      return undefined;
    }
    if (!hex.resourceType) {
      return undefined;
    }

    switch (hex.resourceType) {
      case ResourceType.AnyPort:
        return [3, 3, 3, 3, 3];
      case ResourceType.WoodPort:
        return [2, 4, 4, 4, 4];
      case ResourceType.BrickPort:
        return [4, 2, 4, 4, 4];
      case ResourceType.SheepPort:
        return [4, 4, 2, 4, 4];
      case ResourceType.GrainPort:
        return [4, 4, 4, 2, 4];
      case ResourceType.OrePort:
        return [4, 4, 4, 4, 2];
      default:
        return undefined;
    }
  }
}

export function gameFromString(json: string): Game {

  const game: Game = Object.assign(new Game({}), JSON.parse(json));
  game.setChildPrototypes();

  return game;
}
