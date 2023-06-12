/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import { Game, GamePhase, gameFromString } from 'soos-gamelogic';
import ServerAction from './server-action.js';

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

app.get('/api/result', (req: Request, res: Response) => {
  const game = new Game({});
  res.send('Hello World!');
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

  setInterval(() => {
    if (game.gamePhase === GamePhase.MainGameplay && id == 0) {
      game.nextPlayer();
      for (let i = premoveActions.length - 1; i >= 0; i--) {
        const premove = premoveActions[i];
        if (game.executeTownActionJSON(premove.actionJSON, premove.playerID)) {
          console.log('Completed action!' + premove.actionJSON);
          premoveActions.splice(i);
          //notify the client that executed the action that the premove is finished!
          //socket.emit('executedPremove', premove.actionJSON);
        }
      }
      socket.broadcast.emit('updateGameState', game.toString())
      socket.emit('updateGameState', game.toString())
    }
  }, 10000)

  socket.on('newGameState', (newGameState) => {
    console.log(`got New Game State`);
    game = gameFromString(newGameState);
    socket.broadcast.emit('updateGameState', newGameState);
  });

  socket.on('premove', (myJSON) => {
    console.log('got new premove:' + id + ' wants ' + myJSON);
    //socket.broadcast.emit('updateGameState', game.toString());
    const newAction = new ServerAction(myJSON, id);
    console.log(newAction);
    premoveActions.push(newAction);
    //socket.emit('addedPremove', newAction);
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
  })

  socket.on('disconnect', () => {
    console.log(`user ${id} disconnected`);
    connectedPlayers[id] = null;
  });

  socket.emit('updateGameState', game.toString());
});


server.listen(port, () => {
  console.log(`Settlers of Open Source server listening on port ${port}`);
});
