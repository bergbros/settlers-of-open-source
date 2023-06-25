import Player from './game-player.js';
import { HexCoords } from './index.js';
import EdgeCoords, { hydrateEdgeCoords } from './utils/edge-coords.js';
import { HexDirection } from './utils/hex-coords.js';

export default class GameRoad {
  coords: EdgeCoords;

  // TODO this needs to be playerIdx instead of player
  // for serialization to work
  player?: Player;

  display: boolean;

  constructor(coords?: EdgeCoords) {
    this.coords = coords || new EdgeCoords(new HexCoords(0, 0), HexDirection.E);
    this.player = undefined;
    this.display = false;
  }

  setChildPrototypes() {
    this.coords = hydrateEdgeCoords(this.coords);
  }

  getType() {
    return 'GameRoad';
  }

  claimRoad(player: Player) {
    if (!player) {
      throw new Error('Can\'t claim road without player');
    }
    if (this.player) {
      throw new Error('Road already claimed' + this.coords.toString());
    }
    this.player = player;
  }

  isClaimed(): boolean {
    return (this.player !== undefined);
  }

  setDisplay(display: boolean) {
    this.display = display;
  }

  resetDisplay() {
    if (this.player) {
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
}
