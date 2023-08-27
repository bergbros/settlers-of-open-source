/* eslint-disable @typescript-eslint/no-unsafe-call */
import express, { Express } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookieSession from 'cookie-session';

import { apiRouter } from './routes/api/index.js'
import { timingMiddleware } from './routes/utils.js';

import { registerSocketListeners } from './routes/socket-io/index.js';

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

io.on('connection', socket => {
  registerSocketListeners(socket, io);
  socket.on('check1', () => {
    console.log('check1');
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  //socket.emit('updateGameState', game.toString());
});

server.listen(port, () => {
  console.log(`Settlers of Open Source server listening on port ${port}`);
});

