import Player from './game-player.js';
import { AllResourceTypes } from './terrain-type.js';
import HexCoords from './utils/hex-coords.js';
import VertexCoords, { hydrateVertexCoords } from './utils/vertex-coords.js';

export default class GameTown {
  coords?: VertexCoords;
  playerIdx?: number;
  townLevel: number;
  display: boolean;
  highlighted: boolean;
  production: number[];
  eval: number;
  constructor(coords?: VertexCoords) {
    if (coords) {
      this.coords = coords;
    }
    this.playerIdx = undefined;
    this.townLevel = 0;
    this.eval = 0;//player specific eval number
    this.display = false;
    this.highlighted = false;
    this.production = [];
    for (const resource of AllResourceTypes) {
      this.production.push(0);
    }
  }

  claimTown(playerIdx: number) {
    if (playerIdx === undefined) {
      throw new Error('Can\'t claim town without player');
    }
    if (this.playerIdx) {
      throw new Error('town already claimed');
    }

    this.playerIdx = playerIdx;
    this.townLevel = 1;
  }

  upgradeCity() {
    if (this.playerIdx === undefined) {
      throw Error;
    }
    this.townLevel++;
  }

  isUnclaimed(): boolean {
    return this.playerIdx === undefined;
  }

  getType() {
    return 'GameTown';
  }

  getCoords() {
    return this.coords;
  }

  showMe() {
    this.display = true;
  }

  resetDisplay() {
    this.display = this.playerIdx !== undefined;
    this.highlighted = false;
  }

  highlightMe() {
    this.highlighted = true;
  }

  setChildPrototypes() {
    if (this.coords) {
      this.coords = hydrateVertexCoords(this.coords);
    }
  }

}
