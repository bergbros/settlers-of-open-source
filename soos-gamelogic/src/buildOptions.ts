import { EdgeCoords, Game } from './index.js';

export enum BuildOptions {
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
    return '';
}

export type BuildAction = {
    type: BuildOptions,
    playerId: number,
    isPossible: (gameState: Game) => boolean,
    shouldDisqualify: (gameState: Game) => boolean,
    execute: (gameState: Game) => void,
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
        gameState.map.roadAt(this.location)?.claimRoad(player);
    }
}
