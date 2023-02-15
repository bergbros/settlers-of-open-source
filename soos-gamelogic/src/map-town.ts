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

    claimCity(player: Player) {
        if (this.player === undefined) throw Error;
        this.player = player;
        this.townLevel = 1;
    }

    upgradeCity() {
        if (this.player === undefined) throw Error;
        this.townLevel++;
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