/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import { Game, gameFromString } from 'soos-gamelogic';

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
let game = new Game({ debugAutoPickSettlements: false });

io.on('connection', socket => {
  let id = connectedPlayers.indexOf(null);
  if (id === -1) {
    id = connectedPlayers.length;
  }

  console.log('user connected! giving id: ' + id);
  connectedPlayers[id] = socket;
  socket.emit('playerId', id);

  socket.on('newGameState', (newGameState) => {
    console.log(`got New Game State`);
    game = gameFromString(newGameState);
    socket.broadcast.emit('updateGameState', newGameState);
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
