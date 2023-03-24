import Player from './game-player.js';
import VertexCoords from './utils/vertex-coords.js';

export default class GameTown {
    coords: VertexCoords;
    player?: Player;
    townLevel: number;
    display: boolean;
    highlighted: boolean;

    constructor(coords: VertexCoords) {
        this.coords = coords;
        this.player = undefined;
        this.townLevel = 0;
        this.display = false;
        this.highlighted = false;
    }

    claimTown(player: Player) {
        if (!player)
            throw new Error(`Can't claim town without player`);
        if (this.player)
            throw new Error(`town already claimed`);

        this.player = player;
        this.townLevel = 1;
    }

    upgradeCity() {
        if (!this.player) throw Error;
        this.townLevel++;
    }

    isUnclaimed(): boolean {
        return !this.player;
    }

    getType() {
        return "GameTown";
    }

    getCoords() {
        return this.coords;
    }

    showMe() {
        this.display = true;
    }

    resetDisplay() {
        this.display = this.player !== undefined;
        this.highlighted = false;
    }

    highlightMe() {
        this.highlighted = true;
    }
}
