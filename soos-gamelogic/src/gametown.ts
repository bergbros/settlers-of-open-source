import Player from './gameplayer';
import VertexCoords from './utils/vertex-coords';

export default class GameTown {
    coords: VertexCoords;
    player?: Player;
    townLevel: number;
    display:boolean;

    constructor(coords: VertexCoords) {
        this.coords = coords;
        this.player = undefined;
        this.townLevel = 0;
        this.display = false;
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
    showMe(){
        this.display= true;
    }
    resetDisplay(){
        this.display = this.player!==undefined;
    }
}
