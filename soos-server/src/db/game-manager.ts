import { Game } from 'soos-gamelogic';
import ServerAction from '../server-action.js';

import { generateGameCode } from './utils.js';
import { DataManager } from './data-manager.js';
import { userManager } from './user-manager.js';

import { RemoteSocket, Socket } from 'socket.io';

export type PlayerDataFields = {
  userID: string,
  playerIndex: number,
  connected: boolean
}

export type GameSlot = {
  gamecode: string,
  game: Game,
  players: DataManager<PlayerDataFields>,
  launched: boolean,
  premoveActions: ServerAction[]
}

class GameManager {
  private gameTable: DataManager<GameSlot>;

  public constructor() {
    this.gameTable = new DataManager();
  }

  public getGame(gamecode: string) {
    var game = this.gameTable.getObjectByAttr('gamecode', gamecode) as GameSlot;
    if (game) {
      return game;
    } else {
      return null;
    }
  }

  public gameExists(gamecode: string) {
    if (this.getGame(gamecode)) {
      return true;
    } else {
      return false;
    }
  }

  public createGame(gamecode?: string) {
    gamecode = gamecode || generateGameCode();
    var createdGame: GameSlot = {
      gamecode: gamecode,
      game: new Game({ debugAutoPickSettlements: false }),
      players: new DataManager(),
      premoveActions: [],
      launched: false
    }
    this.gameTable.addObject(createdGame);

    return gamecode;
  }

  public launchGame(gamecode: string, playerSockets: any[]) {
    var game = this.getGame(gamecode);
    if (!game)
      throw new Error();

    let playerIndex = 0;
    let players: string[] = [];

    // These might actually be RemoteSockets (hence the any[] above) but it shouldn't matter here.
    playerSockets.forEach((playerSocket: Socket) => {
      var player = userManager.getUserBySocketID(playerSocket.id);
      if (!player)
        throw new Error(); // unassociated socket
      // Possibly also check that player.userID == socket.data.userID

      var pdf: PlayerDataFields = {
        userID: player.userID,
        playerIndex: playerIndex,
        connected: true
      }

      game?.players.addObject(pdf);
      players.push(player.userID);
      //playerSocket.emit('playerId', players[length]);
    });

    console.log(`Launching game ${gamecode} with players ${players}`)
  }

  public updateGame(gamecode: string, game: Game) {
    console.log('Updating game ' + gamecode);
    var gameStorageUnit = this.getGame(gamecode);
    if (!gameStorageUnit)
      return false;

    gameStorageUnit.game = game;
    return true;
  }

  public getPlayerIndexBySocketID(gamecode: string, socketID: string): number {
    let user = userManager.getUserBySocketID(socketID);
    if (!user) {
      const userId = userManager.addUser(socketID.slice(0, 3))!;
      user = userManager.getUserByUserID(userId)!;

      // TODO put error back
      // throw new Error('Socket ' + socketID + ' not associated with any userID');
    }

    var game = this.getGame(gamecode);
    var player = game?.players.getObjectByAttr('userID', user.userID) as PlayerDataFields;

    if (!player) {
      player = game?.players.dataTable[0]!;

      // TODO put error back
      // throw new Error('User ' + user.userID + ' not in game');
    }

    return player.playerIndex;
  }

  public gameActive(gamecode: string): boolean {
    var game = this.getGame(gamecode);
    if (!game)
      return false;
    return game.launched;
  }

  public deleteGame(gamecode: string) {
    var result = this.gameTable.removeObjectByAttr('gamecode', gamecode);
    if (result)
      return true;
  }
}

export let gameManager = new GameManager();
