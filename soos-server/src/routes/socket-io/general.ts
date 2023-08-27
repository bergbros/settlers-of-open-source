import { Socket, Server } from 'socket.io'

export const registerGeneralSocketListeners = (socket: Socket, io: Server) => {
  console.log('Registering general socket listeners');

  /* Can add middleware here:
  io.use((socket: Socket, next: NextFunction(or some type idk)) => {
    if (socket.event == 'submitbuild') {
      next();
    } else {
      next(new Error("invalid"));
    }
  });
  */

  socket.on('check', () => {
    console.log('check');
  });
}