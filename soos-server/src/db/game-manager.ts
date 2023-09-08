import { Game } from 'soos-gamelogic';
import ServerAction from '../server-action.js';

import { generateGameCode } from './utils/utils.js';
import { DataManager } from './data-manager.js';
import { userManager } from './user-manager.js';

import { Socket } from 'socket.io';

export type ServerGamePlayer = {
  userID: string,
  playerIndex: number,
  connected: boolean
};

export type ServerGame = {
  gamecode: string,
  game: Game,
  playerList: DataManager<ServerGamePlayer>,
  launched: boolean,
  premoveActions: ServerAction[]
};

class GameManager {
  private gameTable: DataManager<ServerGame>;

  constructor() {
    this.gameTable = new DataManager();
  }

  getGame(gamecode: string): ServerGame | null {
    return this.gameTable.getObjectByAttr('gamecode', gamecode);
  }

  gameExists(gamecode: string) {
    return !!this.getGame(gamecode);
  }

  createGame(gamecode?: string) {
    gamecode = gamecode || generateGameCode();
    const createdGame: ServerGame = {
      gamecode: gamecode,
      game: new Game({ debugAutoPickSettlements: false }),
      playerList: new DataManager(),
      premoveActions: [],
      launched: false,
    };
    this.gameTable.addObject(createdGame);

    return gamecode;
  }

  launchGame(gamecode: string, playerSockets: any[]) {
    const game = this.getGame(gamecode);
    if (!game) {
      throw new Error();
    }

    const players: string[] = [];

    // These might actually be RemoteSockets (hence the any[] above) but it shouldn't matter here.
    for (let i = 0; i < playerSockets.length; i++) {
      const playerSocket = playerSockets[i];
      const player = userManager.getUserBySocketID(playerSocket.id);
      if (!player) {
        throw new Error();
      } // unassociated socket
      // Possibly also check that player.userID == socket.data.userID

      game.playerList.addObject({
        userID: player.userID,
        playerIndex: i,
        connected: true,
      });
      players.push(player.userID);
    }

    console.log(`Launching game ${gamecode} with players ${players}`);
  }

  updateGame(gamecode: string, game: Game) {
    console.log('Updating game ' + gamecode);
    const gameStorageUnit = this.getGame(gamecode);
    if (!gameStorageUnit) {
      return false;
    }

    gameStorageUnit.game = game;
    return true;
  }

  getPlayerIndexBySocketID(gamecode: string, socketID: string): number {
    let user = userManager.getUserBySocketID(socketID);
    if (!user) {
      const userId = userManager.addUser(socketID.slice(0, 3))!;
      user = userManager.getUserByUserID(userId)!;

      // TODO put error back
      // throw new Error('Socket ' + socketID + ' not associated with any userID');
    }

    const game = this.getGame(gamecode);
    const player = game?.playerList.getObjectByAttr('userID', user.userID) as ServerGamePlayer;

    if (!player) {
      // player = game?.players.dataTable[0];

      // TODO put error back
      // throw new Error('User ' + user.userID + ' not in game');
    }

    return player.playerIndex;
  }

  gameActive(gamecode: string): boolean {
    const game = this.getGame(gamecode);
    if (!game) {
      return false;
    }
    return game.launched;
  }

  deleteGame(gamecode: string) {
    return this.gameTable.removeObjectByAttr('gamecode', gamecode);
  }
}

export const gameManager = new GameManager();
