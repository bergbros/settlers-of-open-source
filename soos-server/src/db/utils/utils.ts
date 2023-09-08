import { randomBytes } from 'crypto';
import { adjectives, nouns, verbs } from './wordlists/index.js';

export const generateUserID = () => {
  return randomBytes(16).toString('hex');
};

function getNoun(): string {
  return nouns.getRandomWord();
}

function getAdjective(): string {
  return adjectives.getRandomWord();
}

function getVerb(): string {
  return verbs.getRandomWord();
}

const DEBUG=true;
export const generateGameCode = () => {
  if (DEBUG) {
    return 'testgamecode';
  }

  var gamecode = getAdjective() + '-' +
    getNoun() + '-' +
    getVerb() + '-' +
    getNoun();

  return gamecode;
}
