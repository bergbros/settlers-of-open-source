import { Socket, Server } from 'socket.io'

import { Game } from 'soos-gamelogic';
import ServerAction from '../../server-action.js';

import { registerGeneralSocketListeners } from './general.js'
import { registerLobbySocketListeners } from './lobby.js'
import { registerGameSocketListeners } from './game.js'

export const registerSocketListeners = (
  socket: Socket,
  io: Server
) => {
  registerGeneralSocketListeners(socket, io);
  registerLobbySocketListeners(socket, io);
  registerGameSocketListeners(socket, io);
}