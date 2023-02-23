import { useState } from 'react';
import { actionToString, AllBuildOptions, Game, GameHex } from 'soos-gamelogic';
import { GamePhase } from 'soos-gamelogic/src/game';
//import GameHex from 'soos-gamelogic/src/gamehex';
//import GameTown from 'soos-gamelogic/src/gametown';
import './App.scss';
import Hex from './Hex';
import Player from './Player';
import Road from './Road';
import Town from './Town';

export function App() {
  const [game, setGame] = useState<Game>(new Game());

  // Set up force update function
  const [count, setCount] = useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  };

  const hexes = [];
  const towns = [];
  const roads = [];
  const players = [];
  const actions = [];

  for (let i = 0; i < game.map.board.length; i++) {
    for (let k = 0; k < game.map.board[i].length; k++) {
      const gameHex: GameHex = game.map.board[i][k];
      hexes.push(
        <Hex
          gameHex={gameHex}
          onClick={(hexCoords) => game.onHexClicked(hexCoords)}
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

  for (const player of game.players){
    players.push(<Player player = {player}></Player>);
  }

  for (const option of AllBuildOptions){
    actions.push(
      <button 
        onClick = {() => game.executeAction(option)} 
        className= "ActionButton" 
        disabled = {!game.actionViable(option)}>
          {actionToString(option)}
      </button>);
  }


  return (
    <div className="App">
      <div>{game.instructionText}
        </div>
      <div className="App HeaderInfo">
        {actions}
      </div>
      <button 
        onClick = {() => game.nextPlayer()} 
        className= "NextTurnButton" 
        disabled = {game.gamePhase!==GamePhase.MainGameplay}
        >Next Turn</button>
      <div className="App HeaderInfo">{players}</div>
      <div className="Board">
        {hexes}
        {towns}
        {roads}
      </div>
    </div>
  );
}



