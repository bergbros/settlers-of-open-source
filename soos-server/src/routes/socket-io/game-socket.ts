import { Socket, Server } from 'socket.io';

import { AllResourceTypes, EdgeCoords, Game, ResourceType, gameFromString } from 'soos-gamelogic';
import ServerAction from '../../server-action.js';
import { BuildAction, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions.js';
import { gameManager, ServerGame } from '../../db/game-manager.js';

type MiddlewareContext = {
  activeGamecode: string,
  game: Game,
  playerIndex: number,
};

function getGameForSocket(socket: Socket): ServerGame {
  let gamecode: string | null = null;

  if (socket.data.gamecode) {
    gamecode = socket.data.gamecode;
  } else {
    socket.rooms.forEach((roomName) => {
      if (gameManager.gameExists(roomName)) {
        gamecode = roomName;
        socket.data.gamecode = gamecode;
      }
    });
  }

  if (!gamecode) {
    // TODO maybe only do this in development
    gamecode = 'testgamecode';
  }

  if (!gamecode) {
    throw new Error('No game found for socket ' + socket.id);
  } else {
    let gamestorage = gameManager.getGame(gamecode);
    if (!gamestorage) {
      gameManager.createGame(gamecode);
      gamestorage = gameManager.getGame(gamecode)!;

      // TODO throw error in production
      // throw new Error('No game found for socket ' + socket.id);
    }
    return gamestorage;
  }
}

function populateContext(socket: Socket): MiddlewareContext | null {
  try {
    const gameStorage = getGameForSocket(socket);
    const game = gameStorage.game;
    const gamecode = gameStorage.gamecode;
    const playerIndex = gameManager.getPlayerIndexBySocketID(gamecode, socket.id);
    console.log(`populating context for ${playerIndex}, socket id ${socket.id}`);// + gamecode + "//" + game + "//" + playerIndex);
    const context: MiddlewareContext = {
      activeGamecode: gamecode,
      game: game,
      playerIndex: playerIndex,
    };

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
  'playerId',
  'newGameState',
  'autoPickSettlements',
  'build',
  'premove',
  'logPremoves',
  'retrieveGameState',
  'getPremoves',
]);

export const registerGameSocketListeners = (
  socket: Socket,
  io: Server,
) => {
  // Middleware should check that socket is in exactly one gamecode room
  let context: MiddlewareContext | null;

  // for reconnects:
  // if userIsInActiveGame:
  //   socket.emit('updateGameState', game.toString());

  socket.use(([ event, ...args ]: any[], next: Function) => {
    if (gameEvents.has(event)) {
      context = populateContext(socket);
      if (context) {
        next();
      } else {
        return next(new Error());
      }
    } else {
      next();
    }
  });

  socket.on('playerId', (callback) => {
    if (!context) {
      console.log('Context is not defined!');
    }
    console.log('attempting to pass socket playerId: ' + context?.playerIndex);
    callback(context?.playerIndex);
  });

  socket.on('retrieveGameState', (callback) => {
    console.log('retrieveGameState called');
    console.log('Sending socket ' + socket.id + ' game ' + context?.activeGamecode);
    callback(context?.game.toString());
  });

  // socket.on('newGameState', (newGameState) => {
  //   if (!context) {
  //     return new Error();
  //   }

  //   //console.log(newGameState);
  //   console.log('got New Game State');
  //   let premoves: BuildAction[] = [];
  //   if (context.game) {
  //     premoves = context.game.premoveActions;
  //   }
  //   context.game = gameFromString(newGameState);
  //   for (const moves of premoves) {
  //     context.game.addPremove(moves);
  //   }

  //   saveGame(context);
  //   io.to(context.activeGamecode).emit('updateGameState', newGameState);
  // });

  socket.on('autoPickSettlements', () => {
    if (!context) {
      return new Error();
    }

    if (!context.game.setupPhase()) {
      console.error('got autoPickSettlements command but game is not in setup phase');
      return;
    }

    context.game.autoPickSettlements();

    saveGame(context);
    io.to(context.activeGamecode).emit('updateGameState', context.game.toString());
  });

  socket.on('build', (buildAction: BuildAction) => {
    if (!context) {
      return new Error();
    }

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
    if (!context) {
      return new Error();
    }

    premove = hydrateBuildAction(premove);

    console.log('got new premove: player ' + context.playerIndex + ' wants to ' + premove.displayString());
    //io.emit('updateGameState', game.toString());
    context.game.addPremove(premove);
    console.log('premoves: ');
    for (const act of context.game.premoveActions){
      console.log(act.displayString());
    }

    const gameMoves = context.game.getPremoves(context.playerIndex);
    for (let gameMove of gameMoves) {
      gameMove = hydrateBuildAction(gameMove);
    }

    saveGame(context);
    socket.emit('setPremoves', gameMoves);
  });

  socket.on('getPremoves', () => {
    if (!context) {
      return new Error();
    }
    const gameMoves = context.game.getPremoves(context.playerIndex);
    // for (let gameMove of gameMoves) {
    //   gameMove = hydrateBuildAction(gameMove);
    // }
    socket.emit('setPremoves', gameMoves);
  });

  socket.on('nextTurn', ()=>{
    if (!context) {
      return new Error();
    }
    if(true){//context.playerIndex===context.game.currPlayerIdx){
      context.game.nextPlayer();
      saveGame(context);
      io.to(context.activeGamecode).emit('updateGameState', context.game.toString());
    }
  });

  socket.on('trade', (offer:ResourceType, target:ResourceType)=>{
    if (!context) {
      return new Error();
    }

    context.game.executeTrade(offer, target, context.playerIndex);
    saveGame(context);
    io.to(context.activeGamecode).emit('updateGameState', context.game.toString());
  });
  /*This is never called, commenting out for now.

  socket.on('logPremoves', () => {
    console.log();
    console.log();
    console.log();

    for (const serverAction of premoveActions) {
      console.log('premoves: ' + serverAction.playerId + ' wants ' + serverAction.actionJSON);
    }
  });*/

};
