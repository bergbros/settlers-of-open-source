import { Socket, Server } from 'socket.io'
import { userManager } from '../../db/user-manager.js'
import { gameManager } from '../../db/game-manager.js';

export const registerGeneralSocketListeners = (socket: Socket, io: Server) => {

  /* Can add middleware here:
  io.use((socket: Socket, next: NextFunction(or some type idk)) => {
    if (socket.event == 'submitbuild') {
      next();
    } else {
      next(new Error("invalid"));
    }
  });
  */

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

  socket.on('check', () => {
    console.log('check');
  });
}