import { findBestSettlementSpots } from './ai.js';
import { AllBuildCosts, BuildAction, BuildCityAction, BuildActionType, BuildRoadAction, BuildSettlementAction, hydrateBuildAction, BuildActionResponse, actionToString } from './build-actions.js';
import GameMap from './game-map.js';
import GamePlayer from './game-player.js';
import GameTown from './game-town.js';
import { EdgeCoords } from './index.js';
import { AllResourceTypes, resourceToString, ResourceType, TerrainType } from './terrain-type.js';
import HexCoords, { hydrateHexCoords } from './utils/hex-coords.js';
import VertexCoords, { AllVertexDirections, getHexes } from './utils/vertex-coords.js';

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

  constructor(_options: { debugAutoPickSettlements?: boolean }) {
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
    const pickedSpots = findBestSettlementSpots(this, this.players.length * 2);
    let nextSpotIdx = 0;

    // pick settlement for all players
    for (let i = 0; i < this.players.length; i++) {
      const pickedSpot = pickedSpots[nextSpotIdx++];
      const buildAction = new BuildSettlementAction(i, pickedSpot);
      console.log(`picking settlement for player ${i} at ${pickedSpot.toString()}`);
      console.log(this.submitBuildAction(buildAction));
      this.buildRandomRoadForSettlement(i, pickedSpot);
    }

    // now pick again, going in reverse direction this time
    for (let i = this.players.length - 1; i >= 0; i--) {
      const pickedSpot = pickedSpots[nextSpotIdx++];
      const buildAction = new BuildSettlementAction(i, pickedSpot);
      this.submitBuildAction(buildAction);
      this.buildRandomRoadForSettlement(i, pickedSpot);
    }
  }

  buildRandomRoadForSettlement(playerIdx: number, settlementSpot: VertexCoords) {
    const roads = this.map.getRoads(settlementSpot).filter(r => r && r.playerIdx === undefined);
    const randomRoadIdx = Math.floor(Math.random() * roads.length);
    const buildAction = new BuildRoadAction(playerIdx, roads[randomRoadIdx]!.coords);
    console.log(`picking road for player ${playerIdx} at ${buildAction.location.toString()}`);
    console.log(this.submitBuildAction(buildAction));
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

  isLocalPlayerTurn(): boolean {
    return true;
  }

  nextPlayer() {
    this.claimedSettlement = false;

    if (this.gamePhase === GamePhase.PlaceSettlement1) {
      if (this.currPlayerIdx === this.players.length - 1) {
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx++;
        this.instructionText = `${this.getCurrPlayer().name} place first settlement & road`;
      }
    } else if (this.gamePhase === GamePhase.PlaceSettlement2) {
      if (this.currPlayerIdx === 0) {
        this.nextPhaseTurn();
      } else {
        this.currPlayerIdx--;
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
    if (maxPoints > 10) { //max victory point count for game over
      this.gamePhase = GamePhase.GameOver;
      this.endGame(maxPoints);
      this.instructionText = 'The game is over!';
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
      const cost = [ 0, 0, 0, 0, 0 ];
      cost[tradeInResource] = player.tradeRatio[tradeInResource];
      console.log('executing trade:' + cost);
      player.spend(cost);
      player.addCard(AllResourceTypes[tradeForResource]);
    }
    this.forceUpdate();
  }

  displayActionOptions(action: BuildActionType) {
    switch (action) {
    case BuildActionType.Settlement:
      this.claimedSettlement = false;
      this.gamePhase = GamePhase.BuildSettlement;
      for (const road of this.map.roads) {
        if (road.playerIdx !== this.currPlayerIdx) {
          continue;
        }
      }
      break;
    case BuildActionType.City:
      for (const town of this.map.towns) {
        if (town.isUnclaimed()) {
          continue;
        }
      }
      this.claimedSettlement = false;
      this.gamePhase = GamePhase.BuildCity;
      break;
    default:
      console.error(`displayActionOptions unexpected action type: ${actionToString(action)}`);
      break;
    }
    this.forceUpdate();
  }

  getBuildActionTown(town: GameTown, playerId: number, _premove: boolean = false): BuildActionResponse {
    if (town.playerIdx !== undefined && town.playerIdx !== playerId) {
      return { type: 'invalid' };
    }
    if (town.coords === undefined) {
      return { type: 'invalid' };
    }

    let returnAction: BuildAction;
    console.log('making BuildTownAction:');
    if (!town.isUnclaimed() || this.map.settlePremovePresent(town.coords, playerId, this.getPremoves(playerId))) {
      returnAction = new BuildCityAction(playerId, town.coords);
    } else {
      returnAction = new BuildSettlementAction(playerId, town.coords);
    }
    console.log(returnAction);
    //only return valid actions!
    if (returnAction.shouldDisqualify(this)) {//Why is this true during setup?
      console.log('Action Disqualified');
      return { type: 'invalid' };
    } else {
      return returnAction;
    }
  }

  addPremove(buildActionJSON: BuildAction) {
    const buildAction = hydrateBuildAction(buildActionJSON);
    console.log(buildAction.displayString());
    // check if the action is already present in the premoves
    for (const action of this.premoveActions) {
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
        if (action.isPossible(this)) {
          action.execute(this);
        }
      }
      playerIndex++;
      if (playerIndex >= this.players.length) {
        playerIndex = 0;
      }
      loopBreaker++;
      if (loopBreaker > this.players.length + 1) {
        console.log('Infinite loop detected! Emergency measures deployed!');
        return;
      }
    } while (playerIndex !== this.currPlayerIdx);

    //clean-up:
    for (let i = this.premoveActions.length-1; i>=0;i--){
      if(this.premoveActions[i].shouldDisqualify(this)){
        this.premoveActions.splice(i);
      }
    }

    return;
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
      return;
    }

    // Check if there's more than 1 player to rob or automatically pick a player to rob
    if (robbablePlayers.length === 1 || automate) {
      // Only 1 player to rob, rob them automatically
      const randPlayer = Math.floor(Math.random() * robbablePlayers.length);
      this.stealResourceFromPlayer(robbablePlayers[randPlayer]);
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
        //console.log(this.robberHexes);
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
      return [ 3, 3, 3, 3, 3 ];
    case ResourceType.WoodPort:
      return [ 2, 4, 4, 4, 4 ];
    case ResourceType.BrickPort:
      return [ 4, 2, 4, 4, 4 ];
    case ResourceType.SheepPort:
      return [ 4, 4, 2, 4, 4 ];
    case ResourceType.GrainPort:
      return [ 4, 4, 4, 2, 4 ];
    case ResourceType.OrePort:
      return [ 4, 4, 4, 4, 2 ];
    default:
      return undefined;
    }
  }

  getAllValidBuildActions(playerIdx: number){
    const myBuildActions: BuildAction[]= this.map.buildableRoadLocations(playerIdx, this.getPremoves(playerIdx))
      .map(edgeCoords => new BuildRoadAction(playerIdx, edgeCoords));

    for(const action of this.map.buildableTownLocations(playerIdx, this.getPremoves(playerIdx))
      .map(vertexCoords => new BuildSettlementAction(playerIdx, vertexCoords))) {
      myBuildActions.push(action);
    }

    for(const action of this.map.buildableTownLocations(playerIdx, this.getPremoves(playerIdx))
      .map(vertexCoords => new BuildCityAction(playerIdx, vertexCoords))) {
      myBuildActions.push(action);
    }

    return myBuildActions;
  }

  getValidBuildActions(playerIdx: number, type: BuildActionType): BuildAction[] {
    console.log('get valid build actions: ' + type.toString());
    switch (type) {
    case BuildActionType.Road:
      return this.map.buildableRoadLocations(playerIdx, this.getPremoves(playerIdx))
        .map(edgeCoords => new BuildRoadAction(playerIdx, edgeCoords));

    case BuildActionType.Settlement:
      return this.map.buildableTownLocations(playerIdx, this.getPremoves(playerIdx))
        .map(vertexCoords => new BuildSettlementAction(playerIdx, vertexCoords));
    case BuildActionType.City:
      return this.map.buildableCityLocations(playerIdx)
        .map(vertexCoords => new BuildCityAction(playerIdx, vertexCoords));

    default:
      throw new Error(`getValidBuildActions unsupported BuildActionType: ${actionToString(type)}`);
    }
  }

  submitBuildAction(buildAction: BuildAction): boolean {
    if (!buildAction.isPossible(this)) {
      return false;
    }

    return buildAction.execute(this);
  }
}

export function gameFromString(json: string): Game {

  const game: Game = Object.assign(new Game({}), JSON.parse(json));
  game.setChildPrototypes();

  return game;
}
