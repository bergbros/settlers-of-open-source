import { randomBytes } from 'crypto';

export const generateUserID = () => {
  return randomBytes(16).toString('hex');
};

const DEBUG = true;
export const generateGameCode = () => {
  if (DEBUG) {
    return 'testgamecode';
  }

  // TODO implement this to get gamecodes like
  // hidden-tiger-crouching-dragon

  return '';
};
