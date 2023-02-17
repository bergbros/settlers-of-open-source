import Player from './player';
import EdgeCoords from './utils/edge-coords';

export default class GameRoad {
    coords: EdgeCoords;
    player?: Player;

    constructor(coords: EdgeCoords) {
        this.coords = coords;
        this.player = undefined;
    }

    getType() {
        return "GameRoad";
    }

    claimRoad(player: Player) {
        if (!player)
            throw new Error(`Can't claim town without player`);
        if (this.player)
            throw new Error(`town already claimed`);

        this.player = player;
    }
    
    isUnclaimed(): boolean {
        return !this.player;
    }
    getCoords() {
        return this.coords;
    }
}