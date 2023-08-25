import { randomBytes } from 'crypto';

export const genLookupFn = (attr: string, attrVal: string) => {
  let lookupFn = (obj: any) => {
    return obj[attr] === attrVal;
  }
  return lookupFn;
}

export const getObjInTableByAttr = (objTable: any[], attr: string, attrVal: string) => {
  // returns object if found, null if not
  var index = objTable.findIndex(
    genLookupFn(attr, attrVal)
  );
  if (index === -1) {
    return null;
  } else {
    return objTable[index];
  }
}

export const removeObjInTableByAttr = (objTable: any[], attr: string, attrVal: string) => {
  // returns true if removed, false otherwise
  var indexToRemove = objTable.findIndex(
    genLookupFn(attr, attrVal)
  );

  if (indexToRemove === -1) {
    return false;
  } else {
    objTable.splice(indexToRemove, 1);
    return true;
  }
}

export const generateUserID = () => {
  return randomBytes(16).toString('hex');
}

const DEBUG = true;
export const generateGameCode = () => {
  if (DEBUG)
    return 'testgamecode';

  // TODO implement this to get gamecodes like 
  // hidden-tiger-crouching-dragon

  return '';
}