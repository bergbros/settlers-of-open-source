import { randomBytes } from 'crypto';

type User = {
  userID: string,
  socketID: string,
  name: string,
  ownerOfGameCode: string,
}

let userTable: User[] = [];

let genUserLookupFn = (userAttr: string, userAttrVal: string) => {
  let lookupFn = (user: User) => {
    return user[userAttr] === userAttrVal;
  }
  return lookupFn;
}

let generateUserID = () => {
  return randomBytes(16).toString('hex');
}

export var userManager = {
  userTable: userTable,
  addUser: (name: string) => {
    if (userTable.findIndex(genUserLookupFn('name', name)) != -1) {
      return null;
    }

    var userID = generateUserID();
    userTable.push({ userID: userID, socketID: '', name: name, ownerOfGameCode: '' });
    console.log("Added user", userID, userTable);
    return userID;
  },
  removeUser: (userID: string) => {
    var indexToRemove = userTable.findIndex(
      genUserLookupFn('userID', userID)
    );
    userTable.splice(indexToRemove, 1);
  },
  getSocketForUser: (userID: string) => {
    try { //TODO add try-catch everywhere here
      return userTable[userTable.findIndex(
        genUserLookupFn('userID', userID)
      )];
    } catch (error) {
      return null;
    }
  },
  getUserForSocket: (socketID: string) => {
    return userTable[userTable.findIndex(
      genUserLookupFn('socketID', socketID)
    )];
  },
  assocSocketWithUser: (userID: string, socketID: string) => {
    var userIndex = userTable.findIndex(
      genUserLookupFn('userID', userID)
    );
    if (userIndex === -1)
      return false;

    userTable[userIndex].socketID = socketID;
    console.log(`associated socket ${socketID} with user ${userID}`)
    return true;
  },
  makeUserOwnerOfGameCode: (userID: string, gamecode: string) => {
    var userIndex = userTable.findIndex(
      genUserLookupFn('userID', userID)
    );
    if (userIndex === -1)
      return false;

    userTable[userIndex].ownerOfGameCode = gamecode;
    console.log(`made user ${userID} owner of game ${gamecode}`);
    return true;
  },

}