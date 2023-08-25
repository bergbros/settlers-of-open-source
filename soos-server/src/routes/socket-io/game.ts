import { Socket, Server } from 'socket.io'

import { EdgeCoords, Game, gameFromString } from 'soos-gamelogic';
import ServerAction from '../../server-action.js';
import { BuildAction, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions.js';


export const registerGameSocketListeners = (
  socket: Socket,
  io: Server,
  game: Game,
  id: number,
  premoveActions: ServerAction[]
) => {
  socket.on('newGameState', (newGameState) => {
    //console.log(newGameState);
    console.log('got New Game State');
    let premoves: BuildAction[] = [];
    if (game !== undefined)
      premoves = game.premoveActions;
    game = gameFromString(newGameState);
    for (const moves of premoves) {
      game.addPremove(moves);
    }
    io.emit('updateGameState', newGameState);
  });

  socket.on('autoPickSettlements', () => {
    if (!game.setupPhase()) {
      console.error('got autoPickSettlements command but game is not in setup phase');
      return;
    }

    game.autoPickSettlements();
    io.emit('updateGameState', game.toString());
  });

  socket.on('build', (buildAction: BuildAction) => {
    buildAction = hydrateBuildAction(buildAction);

    // make sure people can't submit build actions for other players
    buildAction.playerId = id;

    if (!buildAction.isPossible(game)) {
      console.log('Got invalid build action!', buildAction);
      return;
    }

    buildAction.execute(game);
    io.emit('updateGameState', game.toString());
  });

  socket.on('premove', (premove: BuildAction) => {
    premove = hydrateBuildAction(premove);

    console.log('got new premove: player ' + id + ' wants to ' + premove.displayString());
    //io.emit('updateGameState', game.toString());
    game.addPremove(premove);
    const gameMoves = game.getPremoves(id)
    for (let gameMove of gameMoves) {
      gameMove = hydrateBuildAction(gameMove);
    }
    socket.emit('premoves', gameMoves);
  });

  socket.on('logPremoves', () => {
    console.log();
    console.log();
    console.log();

    for (const serverAction of premoveActions) {
      console.log('premoves: ' + serverAction.playerID + ' wants ' + serverAction.actionJSON);
    }
  });


}