import { useState } from 'react';
import { actionToString, AllBuildOptions, Game, GameHex, GamePhase, RobberPhase } from 'soos-gamelogic';
import './App.scss';
import Hex from './Hex';
import Player from './Player';
import Road from './Road';
import Robber from './Robber';
import Town from './Town';

const debugAutoPickSettlements = true;

export function App() {
  const [game, setGame] = useState<Game>(new Game({ debugAutoPickSettlements }));

  const hexes = [];
  const towns = [];
  const roads = [];
  const players = [];
  const actions = [];
  const robber = [];

  for (let i = 0; i < game.map.board.length; i++) {
    for (let k = 0; k < game.map.board[i].length; k++) {
      const gameHex: GameHex = game.map.board[i][k];
      hexes.push(
        <Hex
          gameHex={gameHex}
          onClick={(hexCoords) => game.onHexClicked(hexCoords)}
          placeRobber={game.gamePhase === GamePhase.PlaceRobber && game.robberPhase === RobberPhase.PlaceRobber}
          key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
        />
      );
    }
  }

  for (const town of game.map.towns) {
    const townCoords = town.coords;

    if (!town.display)
      continue;

    towns.push(
      <Town
        gameTown={town}
        onClick={(vertexCoords) => game.onVertexClicked(vertexCoords)}
        key={`t:${townCoords.hexCoords.x},${townCoords.hexCoords.y},${townCoords.direction}`}
      />
    );
  }

  for (const road of game.map.roads) {
    const roadCoords = road.coords;

    if (!road.showMe())
      continue;

    roads.push(
      <Road
        gameRoad={road}
        onClick={(edgeCoords) => game.onEdgeClicked(edgeCoords)}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />
    );
  }

  for (const player of game.players) {
    players.push(<Player player={player}></Player>);
  }

  for (const option of AllBuildOptions) {
    actions.push(
      <button
        onClick={() => game.executeAction(option)}
        className="ActionButton"
        disabled={!game.actionViable(option)}>
        {actionToString(option)}
      </button>);
  }
  let theRobber = <Robber game={game}></Robber>;
  robber.push(
    theRobber
  );

  // Set up force update function
  const [count, setCount] = useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  };


  const dialogBoxes = [];
  dialogBoxes.push(
    <div id="myModal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close">&times;</span>
          <h2>Modal Header</h2>
        </div>
        <div className="modal-body">
          <p>Some text in the Modal Body</p>
          <p>Some other text...</p>
        </div>
        <div className="modal-footer">
          <h3>Modal Footer</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <div>{game.instructionText}
      </div>
      <div className="App HeaderInfo">
        {actions}
      </div>
      <button
        onClick={() => game.nextPlayer()}
        className="NextTurnButton"
        disabled={game.gamePhase !== GamePhase.MainGameplay}
      >Next Turn</button>
      <div className="App HeaderInfo">{players}</div>
      <div className="Board">
        {hexes}
        {towns}
        {roads}
        {robber}
      </div>
    </div>
  );
}



