/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookieSession from 'cookie-session';

import { userManager } from './user-manager.js'
import { gameManager } from './game-manager.js';

import { apiRouter } from './routes/api/index.js'
import { timingMiddleware } from './routes/utils.js';

import { EdgeCoords, Game, gameFromString } from 'soos-gamelogic';
import ServerAction from './server-action.js';
import { BuildAction, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions.js';

const port = 3000;

const app: Express = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(timingMiddleware);
app.use(express.json());

// Session mgmt
app.use(cookieSession({
  name: 'SoOS-session',
  secret: 'very secure debug secret',
}));

app.use('/api', apiRouter);

const connectedPlayers: (Socket | null)[] = [];
const premoveActions: ServerAction[] = [];
let game = new Game({ debugAutoPickSettlements: false });

io.on('connection', socket => {
  let id = connectedPlayers.indexOf(null);
  if (id === -1) {
    id = connectedPlayers.length;
  }

  console.log('user connected! giving id: ' + id);
  connectedPlayers[id] = socket;
  socket.emit('playerId', id);

  socket.on('associateWithHTTP', (userID: string) => {
    if (!userManager.assocSocketWithUser(userID, socket.id)) {
      console.log(`User ${userID} not found`);
      socket.emit('socketAssocError', `user ${userID} not found`);
    }
  });

  socket.on('joinGame', async (gamecode: string) => {
    if (gameManager.gameExists(gamecode)) {
      socket.join(gamecode);
      console.log(`Socket ${socket.id} has joined room ${gamecode}`);

      var sockets_in_room = await io.in(gamecode).fetchSockets();
      var users_in_room: string[] = [];
      sockets_in_room.forEach(element => {
        users_in_room.push(userManager.getUserForSocket(element.id).name);
      });

      io.to(gamecode).emit('gameUserList', users_in_room);
    } else {
      socket.emit('joinGameError', 'Invalid game code');
    }
  });

  // setInterval(() => {
  //   if (game.gamePhase === GamePhase.MainGameplay && id == 0) {
  //     game.nextPlayer();
  //     // moving this code to the GAME object
  //     // for (let i = premoveActions.length - 1; i >= 0; i--) {
  //     //   const premove = premoveActions[i];
  //     //   if (game.executeTownActionJSON(premove.actionJSON, premove.playerID)) {
  //     //     console.log('Completed action!' + premove.actionJSON);
  //     //     premoveActions.splice(i);
  //     //     //notify the client that executed the action that the premove is finished!
  //     //     //socket.emit('executedPremove', premove.actionJSON);
  //     //   }
  //     // }
  //     io.emit('updateGameState', game.toString());
  //     console.log('sent updated game state');
  //   }
  // }, 10000);

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

  socket.on('check', () => {
    console.log('check');
  });

  socket.on('disconnect', () => {
    console.log(`user ${id} disconnected`);
    connectedPlayers[id] = null;
  });

  socket.emit('updateGameState', game.toString());
});

server.listen(port, () => {
  console.log(`Settlers of Open Source server listening on port ${port}`);
});

