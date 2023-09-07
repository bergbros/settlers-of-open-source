import { Socket, Server } from 'socket.io';

import { Game } from 'soos-gamelogic';
import ServerAction from '../../server-action.js';

import { registerGeneralSocketListeners } from './servergeneral.js';
import { registerLobbySocketListeners } from './serverlobby.js';
import { registerGameSocketListeners } from './servergame.js';

export const registerSocketListeners = (
  socket: Socket,
  io: Server,
) => {
  registerGeneralSocketListeners(socket, io);
  registerLobbySocketListeners(socket, io);
  registerGameSocketListeners(socket, io);
};
