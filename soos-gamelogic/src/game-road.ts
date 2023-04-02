import Player from './game-player.js';
import EdgeCoords from './utils/edge-coords.js';

export default class GameRoad {
    coords: EdgeCoords;
    player?: Player;
    display: boolean;

    constructor(coords: EdgeCoords) {
        this.coords = coords;
        this.player = undefined;
        this.display = false;
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
    setDisplay(display: boolean) {
        this.display = display;
    }
    resetDisplay() {
        if (this.player)
            this.display = true;
        else
            this.display = false;
    }

    showMe(): boolean {
        return this.display;
    }

    getCoords() {
        return this.coords;
    }

    toString() {
        if (!this.player)
            return "";
        else
            return "r;" + this.coords.toString() + ";" + this.player.index;
    }
}