import { Socket, Server } from 'socket.io'
import { gameManager } from '../../db/game-manager.js';
import { userManager } from '../../db/user-manager.js';

export const registerLobbySocketListeners = (socket: Socket, io: Server) => {
  console.log('Registering lobby socket listeners');

  socket.on('associateWithHTTP', (userID: string) => {
    console.log('Assoc with HTTP called with userID ' + userID);
    if (!userManager.assocSocketWithUser(userID, socket)) {
      console.log(`User ${userID} not found`);
      socket.emit('socketAssocError', `user ${userID} not found`);
    }
  });

  socket.on('joinGame', async (gamecode: string) => {
    if (gameManager.gameExists(gamecode)) {
      socket.join(gamecode);
      socket.data.gamecode = gamecode;
      console.log(`Socket ${socket.id} has joined room ${gamecode}`);

      var sockets_in_room = await io.in(gamecode).fetchSockets();
      var users_in_room: string[] = [];
      sockets_in_room.forEach(sckt => {
        var user = userManager.getUserBySocketID(sckt.id)
        if (user)
          users_in_room.push(user.name);
        // else probably throw error? socket not assoc. with user?
      });

      io.to(gamecode).emit('gameUserList', users_in_room);
    } else {
      socket.emit('joinGameError', 'Invalid game code');
    }
  });

  socket.on('launchGame', async () => {
    var gamecode = socket.data.gamecode;
    if (!gamecode)
      return new Error('Socket not associated with game');
    // Check if user is game owner
    // Check that it's a valid gamecode
    var players = await io.in(gamecode).fetchSockets();
    try {
      gameManager.launchGame(gamecode, players);
    } catch (e) {
      return new Error('Game failed to launch');
    }

    io.to(gamecode).emit('gameLaunch');
  });
}