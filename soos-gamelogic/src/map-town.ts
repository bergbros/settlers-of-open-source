import Player from './player';
import EdgeCoords from './utils/edge-coords';
import VertexCoords from './utils/vertex-coords';

export default class MapTown {
    coords: VertexCoords;
    player?: Player;
    townLevel: number;

    constructor(coords: VertexCoords) {
        this.coords = coords;
        this.player = undefined;
        this.townLevel = 0;
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
        return "MapTown";
    }

    getCoords() {
        return this.coords;
    }
}

export class MapRoad {
    coords: EdgeCoords;

    constructor(coords: EdgeCoords) {
        this.coords = coords;
    }

    getType() {
        return "MapRoad";
    }
}