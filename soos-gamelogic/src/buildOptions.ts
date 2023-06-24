import { EdgeCoords, Game, HexCoords, VertexCoords } from './index.js';

export enum BuildOptions {
    actionCompleted = -2,
    invalidAction = -1,
    Road = 0,
    Settlement = 1,
    City = 2,
    Development = 3,
    //Trade = 4
};

export const AllBuildOptions = Object.freeze([
    BuildOptions.Road,
    BuildOptions.Settlement,
    BuildOptions.City,
    BuildOptions.Development,
    //BuildOptions.Trade
]);

export const AllBuildCosts = Object.freeze([
    [1, 1, 0, 0, 0], //road
    [1, 1, 1, 1, 0], //settlement
    [0, 0, 0, 3, 2], //city
    [0, 0, 1, 1, 1], //development
    //[-4, -4, -4, -4, -4] //resource trading
]);

export function actionToString(action: BuildOptions): string {
    switch (action) {
        case BuildOptions.Road:
            return "Build Road";
        case BuildOptions.Settlement:
            return "Build Settlement";
        case BuildOptions.City:
            return "Build City";
        case BuildOptions.Development:
            return "Buy Development Card";
        //case BuildOptions.Trade:
        //    return "Trade Resources";
    }
    return 'null Action';
}

export type BuildAction = {
    type: BuildOptions,
    playerId: number,
    isPossible: (gameState: Game) => boolean,
    shouldDisqualify: (gameState: Game) => boolean,
    execute: (gameState: Game) => void,
    setChildPrototypes: () => void,
    displayString: () => string,
}

export class NullBuildAction implements BuildAction {
    type = BuildOptions.invalidAction;
    playerId = -1;
    location = new VertexCoords(new HexCoords(-1, -1), 0);
    isPossible(gameState: Game): boolean { return false; }
    shouldDisqualify(gameState: Game): boolean { return true; }
    execute(gameState: Game): void { throw new Error("Tried to execute a null build action!"); }
    setChildPrototypes() {
        this.location = new VertexCoords(new HexCoords(this.location.hexCoords.x, this.location.hexCoords.y), this.location.direction);
    }
    displayString() { return "null action" }
}

export class CompletedBuildAction implements BuildAction {
    type = BuildOptions.actionCompleted;
    playerId = -1;
    location = new VertexCoords(new HexCoords(-1, -1), 0);
    isPossible(gameState: Game): boolean { return false; }
    shouldDisqualify(gameState: Game): boolean { return true; }
    execute(gameState: Game): void { throw new Error("Tried to execute a completed build action!"); }
    setChildPrototypes() {
        this.location = new VertexCoords(new HexCoords(this.location.hexCoords.x, this.location.hexCoords.y), this.location.direction);
    }
    displayString() { return "completed action" }
}

export class BuildRoadAction implements BuildAction {
    type = BuildOptions.Road;
    playerId: number;
    location: EdgeCoords;

    constructor(playerId: number, location: EdgeCoords) {
        this.playerId = playerId;
        this.location = location;
    }

    isPossible(gameState: Game): boolean {
        if (this.shouldDisqualify(gameState)) {
            return false;
        }

        // TODO check adjacent to player's roads

        const player = gameState.players[this.playerId];
        if (player) {
            return player.hasResources(AllBuildCosts[this.type]);
        }
        return false;
    }

    shouldDisqualify(gameState: Game): boolean {
        return !!gameState.map.roadAt(this.location)?.isClaimed();
    }

    execute(gameState: Game): void {
        const player = gameState.players[this.playerId];
        if (gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
            gameState.map.roadAt(this.location)?.claimRoad(player);
        } else {
            throw new Error("Tried to execute action without sufficient resources! " + actionToString(AllBuildOptions[this.type]));
        }
    }
    displayString() { return actionToString(this.type) + " " + this.location.toString }
    setChildPrototypes() {
        this.location = new EdgeCoords(new HexCoords(this.location.hexCoords.x, this.location.hexCoords.y), this.location.direction);
    }
}


export class BuildSettlementAction implements BuildAction {
    type = BuildOptions.Settlement;
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

    execute(gameState: Game): void {
        if (gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
            gameState.map.townAt(this.location)?.claimTown(this.playerId);
        } else {
            throw new Error("Tried to execute action without sufficient resources! " + actionToString(AllBuildOptions[this.type]));
        }
    }
    displayString() { return actionToString(this.type) + " " + this.location.toString }
    setChildPrototypes() {
        this.location = new VertexCoords(new HexCoords(this.location.hexCoords.x, this.location.hexCoords.y), this.location.direction);
    }
}


export class BuildCityAction implements BuildAction {
    type = BuildOptions.City;
    playerId: number;
    location: VertexCoords;

    constructor(playerId: number, location: VertexCoords) {
        this.playerId = playerId;
        this.location = location;
    }

    isPossible(gameState: Game): boolean {
        if (this.shouldDisqualify(gameState)) {//city action: town has to be claimed, and player ID has to be the same.
            return false;
        }
        const player = gameState.players[this.playerId];
        if (player) {
            return player.hasResources(AllBuildCosts[this.type]);
        }
        return false;
    }

    shouldDisqualify(gameState: Game): boolean {
        return !!gameState.map.townAt(this.location)?.isUnclaimed() || gameState.map.townAt(this.location)?.playerIdx !== this.playerId;
    }

    execute(gameState: Game): void {
        if (gameState.players[this.playerId].spend(AllBuildCosts[this.type])) {
            gameState.map.townAt(this.location)?.upgradeCity();
        } else {
            throw new Error("Tried to execute action without sufficient resources! " + actionToString(AllBuildOptions[this.type]));
        }
    }
    displayString() { return actionToString(this.type) + " " + this.location.toString }
    setChildPrototypes() {
        this.location = new VertexCoords(new HexCoords(this.location.hexCoords.x, this.location.hexCoords.y), this.location.direction);
    }
}
