import { EdgeCoords, Game, HexCoords, VertexCoords, resourceToSymbol } from './index.js';
import { hydrateEdgeCoords } from './utils/edge-coords.js';
import { hydrateVertexCoords } from './utils/vertex-coords.js';

export enum BuildActionType {
  Road = 0,
  Settlement = 1,
  City = 2,
  Development = 3,
}

export const AllBuildActionTypes = Object.freeze([
  BuildActionType.Road,
  BuildActionType.Settlement,
  BuildActionType.City,
  BuildActionType.Development,
]);

export const AllBuildCosts = Object.freeze([
  [ 1, 1, 0, 0, 0 ], //road
  [ 1, 1, 1, 1, 0 ], //settlement
  [ 0, 0, 0, 3, 2 ], //city
  [ 0, 0, 1, 1, 1 ], //development
]);

export function actionToString(action: BuildActionType): string {
  switch (action) {
  case BuildActionType.Road:
    return 'Road';
  case BuildActionType.Settlement:
    return 'Settlement';
  case BuildActionType.City:
    return 'City';
  case BuildActionType.Development:
    return 'Development Card';
  }
  return 'null Action';
}

export function actionCostString(action: BuildActionType): string {
  const cost = AllBuildCosts[action]!;

  return cost.map((num, index) => {
    if (num === 0) {
      return null;
    }

    return `${resourceToSymbol(index)}${num}`;
  }).filter(a => !!a).join(' ');
}

export type BuildActionResponse = { type: 'invalid' } | { type: 'complete' } | BuildAction;

export type BuildAction = {
  type: BuildActionType,
  playerId: number,
  location: any,
  isPossible: (gameState: Game) => boolean,
  shouldDisqualify: (gameState: Game) => boolean,
  execute: (gameState: Game) => boolean,
  setChildPrototypes: () => void,
  displayString: () => string,
  equals: (BuildAction) => boolean,
};

export function hydrateBuildAction(buildAction: BuildAction): BuildAction {
  let action;
  switch (buildAction.type) {
  case BuildActionType.Road:
    action = new BuildRoadAction(buildAction.playerId, (buildAction as BuildRoadAction).location);
    break;
  case BuildActionType.Settlement:
    action = new BuildSettlementAction(buildAction.playerId, (buildAction as BuildSettlementAction).location);
    break;
  case BuildActionType.City:
    action = new BuildCityAction(buildAction.playerId, (buildAction as BuildCityAction).location);
    break;
  case BuildActionType.Development:
    action = new BuildDevelopmentCardAction(buildAction.playerId);
    break;
  default:
    throw new Error(`Can't hydrate build action of type ${buildAction.type}`);
  }
  action.setChildPrototypes();
  return action;
}

export class BuildRoadAction implements BuildAction {
  type = BuildActionType.Road;
  playerId: number;
  location: EdgeCoords;

  constructor(playerId: number, location: EdgeCoords) {
    this.playerId = playerId;
    this.location = location;
  }

  isPossible(gameState: Game): boolean {
    if (this.shouldDisqualify(gameState)) {
      console.log("road is claimed");
      return false;
    }

    // if it's setup phase, it just needs to be their turn
    if (gameState.setupPhase()) {
      console.log("road being built during set up phase");
      return gameState.currPlayerIdx === this.playerId && gameState.claimedSettlement;
    }

    const player = gameState.players[this.playerId];
    if (player===undefined || !player.hasResources(AllBuildCosts[this.type])) {
      console.log("player does not have resources or player does not exist");
      return false;
    }

    // New location must be adjacent to an existing town or road for this player
    const validLocations = gameState.map.buildableRoadLocations(this.playerId);
    return validLocations.some(loc => this.location.equals(loc));
  }

  shouldDisqualify(gameState: Game): boolean {
    return !!gameState.map.roadAt(this.location)?.isClaimed();
  }

  execute(gameState: Game): boolean {
    console.log('executing build road');
    const player = gameState.players[this.playerId];
    if (gameState.setupPhase() || gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
      const road = gameState.map.roadAt(this.location);
      if (road === undefined) {
        return false;
      }
      road.claimRoad(player);

      if (gameState.setupPhase()) {
        gameState.nextPlayer();
      }

      gameState.forceUpdate();
      return true;
    } else {
      return false;
    }
  }

  displayString() {
    return 'p' + this.playerId + '-' + actionToString(this.type) + ' ' + this.location.toString();
  }

  setChildPrototypes() {
    this.location = hydrateEdgeCoords(this.location);
  }

  equals(compareAction: BuildAction) {
    if (this.type !== compareAction.type) {
      return false;
    }
    compareAction = new BuildRoadAction(compareAction.playerId, compareAction.location);
    return this.location.equals(compareAction.location);
  }

}

export class BuildSettlementAction implements BuildAction {
  type = BuildActionType.Settlement;
  playerId: number;
  location: VertexCoords;

  constructor(playerId: number, location: VertexCoords) {
    this.playerId = playerId;
    this.location = location;
  }

  isPossible(gameState: Game): boolean {
    if (this.shouldDisqualify(gameState)) {
      return false;
    }

    // if it's setup phase, it just needs to be their turn
    if (gameState.setupPhase()) {
      return gameState.currPlayerIdx === this.playerId && !gameState.claimedSettlement;
    }

    // TODO check adjacent to player's roads

    const player = gameState.players[this.playerId];
    if (player) {
      return player.hasResources(AllBuildCosts[this.type]);
    }
    return false;
  }

  shouldDisqualify(gameState: Game): boolean {
    return !gameState.map.townAt(this.location)?.isUnclaimed();
  }

  execute(gameState: Game): boolean {
    if (!gameState.setupPhase() && !gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
      return false;
    }

    const town = gameState.map.townAt(this.location);
    if (town === undefined) {
      return false;
    }

    town.claimTown(this.playerId);
    if (gameState.setupPhase()) {
      gameState.claimedSettlement = true;

      // TODO get resources for settlements you're next to
    }

    gameState.updatePlayerTradeRatios(town);
    gameState.updatePlayerProduction(town);
    gameState.updateRobberHexes(town);
    gameState.forceUpdate();
    return true;
  }

  displayString() {
    return 'p' + this.playerId + '-' + actionToString(this.type) + ' ' + this.location.toString();
  }

  setChildPrototypes() {
    this.location = hydrateVertexCoords(this.location);
  }

  equals(compareAction: BuildAction) {
    if (this.type !== compareAction.type) {
      return false;
    }
    compareAction = new BuildSettlementAction(compareAction.playerId, compareAction.location);
    return this.location.equals(compareAction.location);
  }
}

export class BuildCityAction implements BuildAction {
  type = BuildActionType.City;
  playerId: number;
  location: VertexCoords;

  constructor(playerId: number, location: VertexCoords) {
    this.playerId = playerId;
    this.location = location;
  }

  isPossible(gameState: Game): boolean {
    if (this.shouldDisqualify(gameState)) {//city action: town has to be claimed, and player ID has to be the same.
      console.log("city not possible: not claimed or wrong player");
      return false;
    }
    const player = gameState.players[this.playerId];
    if (player) {
      console.log("city possible? checking resources");
      return player.hasResources(AllBuildCosts[this.type]);
    }
    console.log("city is possible default fail");
    return false;
  }

  shouldDisqualify(gameState: Game): boolean {
    const validSettlePlan = gameState.settlePremovePresent(this.location, this.playerId);
    console.log('checking valid city move: city owned by ' + gameState.map.townAt(this.location)?.playerIdx + " vs " + this.playerId + " and validSP: " + validSettlePlan);
    return !validSettlePlan || gameState.map.townAt(this.location)?.playerIdx !== this.playerId;
  }

  execute(gameState: Game): boolean {
    console.log('executing build city');
    if (!gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
      return false;
    }

    gameState.map.townAt(this.location)?.upgradeCity();
    gameState.forceUpdate();
    return true;
  }

  displayString() {
    return 'p' + this.playerId + '-' + actionToString(this.type) + ' ' + this.location.toString();
  }

  equals(compareAction: BuildAction) {
    if (this.type !== compareAction.type) {
      return false;
    }
    compareAction = new BuildCityAction(compareAction.playerId, compareAction.location);
    return this.location.equals(compareAction.location);
  }

  setChildPrototypes() {
    this.location = hydrateVertexCoords(this.location);
  }
}

export class BuildDevelopmentCardAction implements BuildAction {
  type = BuildActionType.Development;
  playerId: number;
  location = new VertexCoords(new HexCoords(-1, -1), 0);
  constructor(playerId: number) {
    this.playerId = playerId;
  }

  isPossible(gameState: Game): boolean {
    const player = gameState.players[this.playerId];
    if (player) {
      return player.hasResources(AllBuildCosts[this.type]);
    }
    return false;
  }

  shouldDisqualify(gameState: Game): boolean {
    return false;
  }

  execute(gameState: Game): boolean {
    //todo: implement development cards!
    console.log('TODO: BuildDevelopmentCardAction.execute()');
    gameState.forceUpdate();
    return false;
  }

  displayString() {
    return 'p' + this.playerId + '-' + actionToString(this.type);
  }

  equals(compareAction: BuildAction) {
    return this.type === compareAction.type;
  }

  setChildPrototypes() { }
}
