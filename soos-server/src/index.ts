/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookieSession from 'cookie-session';
import { randomBytes } from 'crypto';

import { EdgeCoords, Game, gameFromString } from 'soos-gamelogic';
import ServerAction from './server-action.js';
import { BuildAction, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions.js';

const port = 3000;

const app: Express = express();
const server = createServer(app);
const io = new Server(server);

// Middleware to log out all requests & their timings
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime: number = Date.now();

  next();

  const endTime: number = Date.now();
  const duration = endTime - startTime;
  console.log(`${req.method} ${req.path} - ${res.statusCode} in ${duration} ms`);
});

// Middleware to get JSON request bodies
app.use(express.json());

// Session mgmt
app.use(cookieSession({
  name: 'SoOS-session',
  secret: 'very secure debug secret',
}));

app.get('/api/result', (req: Request, res: Response) => {
  const game = new Game({});
  res.send('Hello World!');
});

app.get('/api/user/create', (req: Request, res: Response) => {
  var userID = randomBytes(16).toString('hex');

  if (req.session != undefined) {
    req.session.userID = userID;
    console.log('Session ID set');
  }

  res.send(userID);
});

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
    game = gameFromString(newGameState);
    socket.broadcast.emit('updateGameState', newGameState);
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
    socket.broadcast.emit('updateGameState', game.toString());
  });

  socket.on('premove', (premove: BuildAction) => {
    premove = hydrateBuildAction(premove);

    console.log('got new premove: player ' + id + ' wants to ' + premove.displayString());
    //socket.broadcast.emit('updateGameState', game.toString());
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
function hydrateEdgeCoords(whereToBuild: EdgeCoords): EdgeCoords {
  throw new Error('Function not implemented.');
}

