/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookieSession from 'cookie-session';

import { apiRouter } from './routes/api/index.js'
import { timingMiddleware } from './routes/utils.js';

import { registerSocketListeners } from './routes/socket-io/index.js';

import { Game } from 'soos-gamelogic';
import ServerAction from './server-action.js';

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

  registerSocketListeners(socket, io, game, id, premoveActions);

  socket.on('disconnect', () => {
    console.log(`user ${id} disconnected`);
    connectedPlayers[id] = null;
  });

  socket.emit('updateGameState', game.toString());
});

server.listen(port, () => {
  console.log(`Settlers of Open Source server listening on port ${port}`);
});

