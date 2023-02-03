import { ReactNode } from 'react';
import './App.scss';

const HexWidth = 100, HexHeight = 120;
const BoardWidth = 8, BoardHeight = 7;
const Terrain = [
  [ 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w' ],
  [ 'w', 'w', 'd', 'd', 'd', 'd', 'w', 'w' ],
  [ 'w', 'w', 'd', 'g', 'g', 'g', 'd', 'w' ],
  [ 'w', 'd', 'g', 'g', 'g', 'g', 'd', 'w' ],
  [ 'w', 'w', 'd', 'g', 'g', 'g', 'd', 'w' ],
  [ 'w', 'w', 'd', 'd', 'd', 'd', 'w', 'w' ],
  [ 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w' ],
];

export default function App() {
  const board = [];
  for (let y = 0; y < BoardHeight; y++) {
    const isOffset: boolean = y % 2 === 1;

    const row = [];
    for (let x = 0; x < BoardWidth; x++) {
      let xCoord = x * HexWidth;
      if (isOffset) {
        xCoord += HexWidth * .5;
      }

      const yCoord = y * HexHeight * .75;

      let terrainClass = '';
      switch (Terrain[y][x]) {
        case 'w': terrainClass = 'water'; break;
        case 'd': terrainClass = 'desert'; break;
        case 'g': terrainClass = 'grass'; break;
      }

      row.push(
        <div className={`Hex ${terrainClass}`} style={{
          left: xCoord + 'px',
          top: yCoord + 'px',
        }}></div>
      );
    }
    board.push(row);
  }

  return (
    <div className="App">
      {board}
    </div>
  );
}
