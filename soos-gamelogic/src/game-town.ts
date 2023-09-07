import Player from './game-player.js';
import { AllResourceTypes } from './terrain-type.js';
import HexCoords from './utils/hex-coords.js';
import VertexCoords, { hydrateVertexCoords } from './utils/vertex-coords.js';

export default class GameTown {
  coords?: VertexCoords;
  playerIdx?: number;
  townLevel: number;
  production: number[];
  eval: number;
  maxLevel:number = 3;
  constructor(coords?: VertexCoords) {
    if (coords) {
      this.coords = coords;
    }
    this.playerIdx = undefined;
    this.townLevel = 0;
    this.eval = 0; // player specific evaluation number (for AI)
    this.production = [];
    for (const _resource of AllResourceTypes) {
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

  upgradeCity(): boolean {
    if (this.playerIdx === undefined || this.townLevel>=this.maxLevel) {
      return false;
    }
    this.townLevel++;
    return true;
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

  setChildPrototypes() {
    if (this.coords) {
      this.coords = hydrateVertexCoords(this.coords);
    }
  }

}
