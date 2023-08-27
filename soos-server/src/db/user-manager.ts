import { generateUserID } from './utils/utils.js';
import { DataManager } from './data-manager.js';
import { Socket } from 'socket.io';

type User = {
  userID: string,
  socketID: string,
  name: string,
  ownerOfGameCode: string,
}

class UserManager {
  private userTable: DataManager;

  public constructor() {
    this.userTable = new DataManager();
  }

  public addUser(name: string) {
    if (this.userTable.objectWithAttrExists('name', name))
      return null;

    var userID = generateUserID();
    this.userTable.addObject({
      userID: userID,
      socketID: '',
      name: name,
      ownerOfGameCode: ''
    });
    console.log("Added user", userID, this.userTable);

    return userID;
  }

  public removeUser(userID: string) {
    var result = this.userTable.removeObjectByAttr('userID', userID);
    if (result) {
      return true;
    } else {
      // throw error
    }
  }

  public getSocketForUser(userID: string) {
    var user = this.userTable.getObjectByAttr('userID', userID) as User;
    if (user) {
      return user.socketID;
    } else {
      return null;
      // maybe throw?
    }
  }

  public getUserBySocketID(socketID: string) {
    var user = this.userTable.getObjectByAttr('socketID', socketID) as User;
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  public getUserByUserID(userID: string) {
    var user = this.userTable.getObjectByAttr('userID', userID) as User;
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  public assocSocketWithUser(userID: string, socket: Socket) {
    var user = this.getUserByUserID(userID);

    if (user) {
      user.socketID = socket.id;
      socket.data.userID = userID;
      console.log(`associated socket ${socket.id} with user ${userID} `)
      return true;
    } else {
      return false;
    }
  }

  public makeUserOwnerOfGameCode(userID: string, gamecode: string) {
    var user = this.getUserByUserID(userID);
    if (user) {
      user.ownerOfGameCode = gamecode;
      console.log(`made user ${userID} owner of game ${gamecode} `);
      return true;
    } else {
      return false;
    }
  }
}

export let userManager = new UserManager();