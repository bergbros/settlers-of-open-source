let gameSet: Set<string> = new Set<string>();

const DEBUG = true;
let generateGameCode = () => {
  if (DEBUG)
    return 'testgamecode';

  // TODO implement this to get gamecodes like 
  // hidden-tiger-crouching-dragon

  return '';
}

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