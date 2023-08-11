import Player from './game-player.js';
import { HexCoords } from './index.js';
import EdgeCoords, { hydrateEdgeCoords } from './utils/edge-coords.js';
import { HexDirection } from './utils/hex-coords.js';

export default class GameRoad {
  coords: EdgeCoords;
  playerIdx?: number;
  display: boolean;

  constructor(coords?: EdgeCoords) {
    this.coords = coords || new EdgeCoords(new HexCoords(0, 0), HexDirection.E);
    this.playerIdx = undefined;
    this.display = false;
  }

  setChildPrototypes() {
    this.coords = hydrateEdgeCoords(this.coords);
  }

  getType() {
    return 'GameRoad';
  }

  claimRoad(player: Player): boolean {
    if (player === undefined || this.isClaimed()) {
      return false;
    }
    this.playerIdx = player.index;
    return true;
  }

  isClaimed(): boolean {
    return (this.playerIdx !== undefined);
  }

  setDisplay(display: boolean) {
    this.display = display;
  }

  resetDisplay() {
    if (this.playerIdx) {
      this.display = true;
    } else {
      this.display = false;
    }
  }

  showMe(): boolean {
    return this.display;
  }

  getCoords() {
    return this.coords;
  }

  toString() {
    if (this.playerIdx !== undefined) {
      return '';
    } else {
      return 'r;' + this.coords.toString() + ';' + this.playerIdx;
    }
  }
}
