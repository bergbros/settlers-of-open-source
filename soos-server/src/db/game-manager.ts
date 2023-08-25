import { Game } from 'soos-gamelogic';
import { generateGameCode } from './utils.js';

let gameSet: Set<string> = new Set<string>();

type PlayerDataFields = {
  userID: string,
  playerIndex: number,
  connected: boolean
}

type GameStorage = {
  gamecode: string,
  game: Game,
  players: PlayerDataFields[]
}

let gameTable: GameStorage[] = [];
// TODO if debug gen testgamecode

export var gameManager = {
  games: gameSet,

  createGame: () => {
    let gamecode = generateGameCode();
    gameSet.add(gamecode);
    return gamecode;
  },
  deleteGame: (gamecode: string) => {
    gameSet.delete(gamecode);
  },
  gameExists: (gamecode: string) => {
    return (gameSet.has(gamecode));
  }
}