import { Component, ReactNode, useState } from 'react';
import { Game, HexCoords, ResourceType, TerrainType, GameHex, GameTown } from 'soos-gamelogic';
//import GameHex from 'soos-gamelogic/src/gamehex';
//import GameTown from 'soos-gamelogic/src/gametown';
import VertexCoords from 'soos-gamelogic/src/utils/vertex-coords';
import './App.scss';
import Hex from './Hex';
import Road from './Road';
import Town from './Town';

const HexWidth = 100, HexHeight = 120;
const BoardWidth = 7, BoardHeight = 7;

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

  for (let i = 0; i < game.map.board.length; i++) {
    for (let k = 0; k < game.map.board[i].length; k++) {
      const gameHex: GameHex = game.map.board[i][k];
      hexes.push(
        <Hex
          gameHex={gameHex}
          onClick={(hexCoords) => game.onHexClicked(hexCoords)}
          key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
        />,
      );
    }
  }
  
  for (const town of game.map.towns) {
    const townCoords = town.coords;
    
    if (town.isUnclaimed() && !game.displayEmptyTowns())
      continue;

    towns.push(
      <Town
        gameTown={town}
        onClick={(vertexCoords) => game.onVertexClicked(vertexCoords)}
        key={`t:${townCoords.hexCoords.x},${townCoords.hexCoords.y},${townCoords.direction}`}
      />,
    );
  }

  console.log(game.map.roads);
  for (const road of game.map.roads) {
    const roadCoords = road.coords;
    
    if (road.isUnclaimed() && !game.displayEmptyRoads())
      continue;

    roads.push(
      <Road
        gameRoad={road}
        onClick={(edgeCoords) => game.onEdgeClicked(edgeCoords)}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />,
    );
  }

  return (
    <div className="App">
      <div className="App HeaderInfo">
        {game.instructionText}
      </div>
      <div className="Board">
        {hexes}
        {towns}
        {roads}
      </div>
    </div>
  );
}



