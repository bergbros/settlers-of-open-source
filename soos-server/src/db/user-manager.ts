import { generateUserID } from './utils/utils.js';
import { DataManager } from './data-manager.js';
import { Socket } from 'socket.io';

type User = {
  userID: string,
  socketID: string,
  name: string,
  ownerOfGameCode: string,
};

class UserManager {
  private userTable: DataManager<User>;

  constructor() {
    this.userTable = new DataManager();
  }

  addUser(name: string) {
    if (this.userTable.objectWithAttrExists('name', name)) {
      return null;
    }

    const userID = generateUserID();
    this.userTable.addObject({
      userID: userID,
      socketID: '',
      name: name,
      ownerOfGameCode: '',
    });
    console.log('Added user', userID, this.userTable);

    return userID;
  }

  removeUser(userID: string) {
    const result = this.userTable.removeObjectByAttr('userID', userID);
    if (result) {
      return true;
    } else {
      // throw error
    }
  }

  getSocketForUser(userID: string) {
    const user = this.userTable.getObjectByAttr('userID', userID) as User;
    if (user) {
      return user.socketID;
    } else {
      return null;
      // maybe throw?
    }
  }

  getUserBySocketID(socketID: string) {
    const user = this.userTable.getObjectByAttr('socketID', socketID) as User;
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  getUserByUserID(userID: string) {
    const user = this.userTable.getObjectByAttr('userID', userID) as User;
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  assocSocketWithUser(userID: string, socket: Socket) {
    const user = this.getUserByUserID(userID);

    if (user) {
      user.socketID = socket.id;
      socket.data.userID = userID;
      console.log(`associated socket ${socket.id} with user ${userID} `);
      return true;
    } else {
      return false;
    }
  }

  makeUserOwnerOfGameCode(userID: string, gamecode: string) {
    const user = this.getUserByUserID(userID);
    if (user) {
      user.ownerOfGameCode = gamecode;
      console.log(`made user ${userID} owner of game ${gamecode} `);
      return true;
    } else {
      return false;
    }
  }
}

export const userManager = new UserManager();
