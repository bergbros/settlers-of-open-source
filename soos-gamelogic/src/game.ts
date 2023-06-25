import { AllBuildCosts, AllBuildOptions, BuildAction, BuildCityAction, BuildOptions, BuildRoadAction, BuildSettlementAction, CompletedBuildAction, NullBuildAction } from './buildOptions.js';
import GameMap from './game-map.js';
import GamePlayer from './game-player.js';
import GameTown from './game-town.js';
import { AllResourceTypes, resourceToString, ResourceType, TerrainType } from './terrain-type.js';
import EdgeCoords from './utils/edge-coords.js';
import HexCoords, { AllHexDirections, HexDirection } from './utils/hex-coords.js';
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
      this.claimTownAt(bestTown.coords);

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
    //Check if any premoves can be executed

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

    } else {
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
        if (twn.playerIdx === plyr.index) {
          plyr.victoryPoints += twn.townLevel;
        }
      }
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
  }

  executeAction(action: BuildOptions) {
    switch (action) {
    case BuildOptions.Road:
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
    case BuildOptions.Settlement:
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
    case BuildOptions.City:
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
    case BuildOptions.Development:

      break;

    }
    this.forceUpdate();
  }

  onClientVertex(vertex: VertexCoords, playerID: number, premove: boolean = false): BuildAction {
    const town = this.map.townAt(vertex);
    if (town === undefined) {
      return new NullBuildAction();
    }

    if (this.setupPhase()) {
      if (this.claimTownAt(vertex).toString()) {
        return new CompletedBuildAction(); //action was successful
      } else {
        return new NullBuildAction(); //no action taken!
      }
    } else {
      if (town.townLevel > 0 && playerID === town.playerIdx) {
        console.log('Added premove to upgrade city');
        return new BuildCityAction(playerID, vertex);
      } else {
        //is there a premove to build a settlement there from this player?
        const settleMove = new BuildSettlementAction(playerID, vertex);
        if (this.premoveActions.indexOf(settleMove) > -1) {
          console.log('Found settle move, created upgrade to city premove');
          return new BuildCityAction(playerID, vertex);
        } else {
          console.log('Created new settle move');
          return settleMove;
        }
      }
    }
  }

  addPremove(buildAction: BuildAction) {
    console.log(buildAction.displayString());
    if (buildAction.shouldDisqualify(this) === false) {
      this.premoveActions.push(buildAction);
    }
  }

  executeTownActionJSON(json: string, playerID: number): boolean {
    //todo: delete? Not currently using JSON town actions
    const town: GameTown = Object.assign(new GameTown(), JSON.parse(json));
    town.setChildPrototypes();

    if (!town.coords) {
      return false;
    }
    const mapTown = this.map.townAt(town.coords);
    if (!mapTown || !mapTown.coords) {
      return false;
    }
    //claim a town
    if (mapTown.isUnclaimed()) {
      return this.claimTownAt(mapTown.coords); //currently handles initial settlements, later settlements, upgrades, and robber placement.
    }
    //upgrade a town
    else {
      if (!mapTown.playerIdx || mapTown.playerIdx !== playerID) {
        return false;
      } //no settlement or belongs to another player
      if (this.players[playerID].spend(AllBuildCosts[BuildOptions.City])) {
        mapTown.upgradeCity();
      } else {
        return false;
      } // player didn't have the money
    }

    return true;
  }

  claimTownAt(vertex: VertexCoords): boolean {
    if (this.claimedSettlement) {
      return false;
    }
    const currPlayer = this.getCurrPlayer();
    const townThere = this.map.townAt(vertex);

    let actionPerformed = false;
    if (this.gamePhase === GamePhase.PlaceSettlement1
      || this.gamePhase === GamePhase.PlaceSettlement2
      || this.gamePhase === GamePhase.BuildSettlement
      || this.gamePhase === GamePhase.MainGameplay) {

      // claim the town

      if (this.gamePhase === GamePhase.PlaceSettlement1
        || this.gamePhase === GamePhase.PlaceSettlement2
        || currPlayer.spend(AllBuildCosts[BuildOptions.Settlement])) {
        townThere?.claimTown(currPlayer.index);
        actionPerformed = true;
        this.updatePlayerTradeRatios(townThere);
        this.updatePlayerProduction(townThere);
        this.updateRobberHexes(townThere);
      }
      this.map.resetDisplayRoads();
      this.map.resetDisplayTowns();

      if (this.gamePhase === GamePhase.PlaceSettlement1 || this.gamePhase === GamePhase.PlaceSettlement2) {
        this.claimedSettlement = true;
        this.map.updateDisplayRoads(vertex);
        if (this.gamePhase === GamePhase.PlaceSettlement2) {
          for (const coords of getHexes(vertex)) {
            const hex = this.map.getHex(coords);
            if (hex && hex.frequency && townThere) {
              currPlayer.addCard(hex.resourceType, 1);
            }
          }
        }
      } else {
        this.gamePhase = GamePhase.MainGameplay;
      }
    } else if (this.gamePhase === GamePhase.BuildCity && townThere?.highlighted) {
      if (currPlayer.spend(AllBuildCosts[BuildOptions.City])) {
        townThere.upgradeCity();
      }
      this.gamePhase = GamePhase.MainGameplay;
      this.map.resetDisplayTowns();
      actionPerformed = true;
    } else if (this.gamePhase === GamePhase.PlaceRobber
      && this.robberPhase === RobberPhase.ChooseWhoToRob
      && townThere?.playerIdx !== undefined
      && townThere?.playerIdx !== this.currPlayerIdx) {

      this.stealResourceFromPlayer(townThere.playerIdx);
      actionPerformed = true;
    }

    this.forceUpdate();
    return actionPerformed;
  }

  onClientEdge(edge: EdgeCoords, playerID: number, premove: boolean = false): BuildAction {
    console.log('on client edge');
    if (this.setupPhase()) {
      console.log('set up phase');
      if (!this.claimedSettlement) {
        return new NullBuildAction();
      }

      if (this.onEdgeClicked(edge))       //setup phase build road code
      {
        return new CompletedBuildAction();
      } else {
        return new NullBuildAction();
      }

    } else {
      console.log('working on premove');
      if (this.gamePhase !== GamePhase.BuildRoad && !premove) {
        return new NullBuildAction();
      }
      return new BuildRoadAction(playerID, edge);
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
    if (this.gamePhase == GamePhase.BuildRoad) {
      currPlayer.spend(AllBuildCosts[BuildOptions.Road]);
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
    return playerMoves;
  }

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

  getEdgeCoords(json: string) {
    if (json[0] !== '(') {
      throw new Error('invalid EdgeCoords json!');
    }
    //delete the ( and )
    json = json.slice(1);
    json = json.slice(json.length);
    const coordsSplit = json.split(',');
    return new EdgeCoords(new HexCoords(+coordsSplit[0], +coordsSplit[1]), +coordsSplit[2]);
  }

  getVertexCoords(json: string) {
    if (json[0] !== '(') {
      throw new Error('invalid HexCoords json!');
    }
    //delete the ( and )
    json = json.slice(1);
    json = json.slice(json.length);
    const coordsSplit = json.split(',');
    return new VertexCoords(new HexCoords(+coordsSplit[0], +coordsSplit[1]), +coordsSplit[2]);
  }

  getHexCoords(json: string) {
    if (json[0] !== '(') {
      throw new Error('invalid HexCoords json!');
    }
    //delete the ( and )
    json = json.slice(1);
    json = json.slice(json.length);
    const coordsSplit = json.split(',');
    return new HexCoords(+coordsSplit[0], +coordsSplit[1]);
  }

  setChildPrototypes() {
    this.map = Object.assign(new GameMap(), this.map);
    this.map.setChildPrototypes();

    for (let i = 0; i < this.players.length; i++) {
      this.players[i] = Object.assign(new GamePlayer(i, this.players[i].name), this.players[i]);
      this.players[i].setChildPrototypes();
    }

    this.robberLocation = new HexCoords(this.robberLocation.x, this.robberLocation.y);

    for (let i = 0; i < this.premoveActions.length; i++) {
      if (this.premoveActions[i].type === BuildOptions.Road) {
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
  // Wood = 0,
  // Brick = 1,
  // Sheep = 2,
  // Grain = 3,
  // Ore = 4,
}

export function gameFromString(json: string): Game {
  const game: Game = Object.assign(new Game({}), JSON.parse(json));
  game.setChildPrototypes();

  return game;
}
