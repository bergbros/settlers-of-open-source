import { Wordlist } from './wordlists.js';

const pathToThisDirectory = 'src/db/utils/wordlists'
const nounsFileName = pathToThisDirectory + '/Wordlist-Nouns-Common-Audited-Len-3-6.txt';
const adjectiveFileName = pathToThisDirectory + '/Wordlist-Adjectives-Common-Audited-Len-3-6.txt';
const verbFileName = pathToThisDirectory + '/mostly-verbs-present-tense.txt'

export let nouns: Wordlist = new Wordlist(nounsFileName);
export let adjectives: Wordlist = new Wordlist(adjectiveFileName);
export let verbs: Wordlist = new Wordlist(verbFileName);