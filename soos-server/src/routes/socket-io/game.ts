import { Socket, Server } from 'socket.io'

import { EdgeCoords, Game, gameFromString } from 'soos-gamelogic';
import ServerAction from '../../server-action.js';
import { BuildAction, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions.js';
import { gameManager, GameStorage } from '../../db/game-manager.js';

type MiddlewareContext = {
  activeGamecode: string,
  game: Game,
  playerIndex: number,
}

function getGameForSocket(socket: Socket): GameStorage {
  let gamecode: string | null = null;

  if (!socket.data.gamecode) {
    socket.rooms.forEach((roomName) => {
      if (gameManager.gameExists(roomName)) {
        gamecode = roomName;
        socket.data.gamecode = gamecode;
      }
    });
  } else {
    gamecode = socket.data.gamecode;
  }

  if (!gamecode) {
    throw new Error('No game found for socket ' + socket.id);
  } else {
    var gamestorage = gameManager.getGame(gamecode);
    if (!gamestorage)
      throw new Error('No game found for socket ' + socket.id);
    return gamestorage;
  }
}

function populateContext(socket: Socket): MiddlewareContext | null {
  try {
    var gameStorage = getGameForSocket(socket);
    var game = gameStorage.game;
    var gamecode = gameStorage.gamecode;
    var playerIndex = gameManager.getPlayerIndexBySocketID(gamecode, socket.id);

    let context: MiddlewareContext = {
      activeGamecode: gamecode,
      game: game,
      playerIndex: playerIndex
    }

    return context;
  } catch (e) {
    console.log(e);
    return null;
  }
}

function saveGame(context: MiddlewareContext) {
  gameManager.updateGame(context.activeGamecode, context.game);
}

const gameEvents: Set<string> = new Set([
  'playerID',
  'newGameState',
  'autoPickSettlements',
  'build',
  'premove',
  'logPremoves',
  'retrieveGameState',
]);

export const registerGameSocketListeners = (
  socket: Socket,
  io: Server
) => {
  // Middleware should check that socket is in exactly one gamecode room
  let context: MiddlewareContext | null;

  // for reconnects:
  // if userIsInActiveGame:
  //   socket.emit('updateGameState', game.toString());

  socket.use(([event, ...args]: any[], next: Function) => {
    if (gameEvents.has(event)) {
      context = populateContext(socket);
      if (context)
        next();
      else
        return next(new Error());
    } else {
      next();
    }
  });

  socket.on('playerID', (callback) => {
    callback(context?.playerIndex);
  });

  socket.on('retrieveGameState', (callback) => {
    console.log('retrieveGameState called');
    console.log('Sending socket ' + socket.id + ' game ' + context?.activeGamecode);
    callback(context?.game.toString());
  });

  socket.on('newGameState', (newGameState) => {
    if (!context)
      return new Error();

    //console.log(newGameState);
    console.log('got New Game State');
    let premoves: BuildAction[] = [];
    if (context.game)
      premoves = context.game.premoveActions;
    context.game = gameFromString(newGameState);
    for (const moves of premoves) {
      context.game.addPremove(moves);
    }

    saveGame(context);
    io.to(context.activeGamecode).emit('updateGameState', newGameState);
  });

  socket.on('autoPickSettlements', () => {
    if (!context)
      return new Error();

    if (!context.game.setupPhase()) {
      console.error('got autoPickSettlements command but game is not in setup phase');
      return;
    }

    context.game.autoPickSettlements();

    saveGame(context);
    io.to(context.activeGamecode).emit('updateGameState', context.game.toString());
  });

  socket.on('build', (buildAction: BuildAction) => {
    if (!context)
      return new Error();

    buildAction = hydrateBuildAction(buildAction);

    // make sure people can't submit build actions for other players
    buildAction.playerId = context.playerIndex;

    if (!buildAction.isPossible(context.game)) {
      console.log('Got invalid build action!', buildAction);
      return;
    }

    buildAction.execute(context.game);

    saveGame(context);
    io.to(context.activeGamecode).emit('updateGameState', context.game.toString());
  });

  socket.on('premove', (premove: BuildAction) => {
    if (!context)
      return new Error();

    premove = hydrateBuildAction(premove);

    console.log('got new premove: player ' + context.playerIndex + ' wants to ' + premove.displayString());
    //io.emit('updateGameState', game.toString());
    context.game.addPremove(premove);
    const gameMoves = context.game.getPremoves(context.playerIndex);
    for (let gameMove of gameMoves) {
      gameMove = hydrateBuildAction(gameMove);
    }

    saveGame(context);
    socket.emit('premoves', gameMoves);
  });

  socket.on('disconnect', () => {
  });



  /*This is never called, commenting out for now. 
  
  socket.on('logPremoves', () => {
    console.log();
    console.log();
    console.log();

    for (const serverAction of premoveActions) {
      console.log('premoves: ' + serverAction.playerID + ' wants ' + serverAction.actionJSON);
    }
  });*/


}