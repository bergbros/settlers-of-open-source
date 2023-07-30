let gameSet: Set<string> = new Set<string>();

let generateGameCode = () => {
  // TODO: implement this
  return 'testgamecode';
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