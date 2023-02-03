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
      xCoord+=55;
      const yCoord = y * HexHeight * .75+55;

      let terrainClass = '';
      switch (Terrain[y][x]) {
        case 'w': terrainClass = 'water'; break;
        case 'd': terrainClass = 'desert'; break;
        case 'g': terrainClass = 'grass'; break;
      }

      row.push(
        <div 
          className={`Hex ${terrainClass}`} style={{
            left: xCoord + 'px',
            top: yCoord + 'px',
          }}
          key = 'h:${xCoord},${yCoord}'
          >
        </div>
      );
      
      const ssRadius = 20/2;
      //add top left settlement spot on each hex
      let ssXCoord = xCoord - ssRadius ;
      let ssYCoord = yCoord - ssRadius+ HexHeight*.25;
      row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},6'));

      //add top center settlement spot on each hex
      ssXCoord = xCoord - ssRadius + HexWidth*0.5 ;
      ssYCoord = yCoord - ssRadius;
      row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},1'));

      //add right corners for end of row hexes
      if(x === BoardWidth-1){
        ssXCoord = xCoord - ssRadius + HexWidth;
        ssYCoord = yCoord - ssRadius + HexHeight*0.25;
        row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},2'));
        ssXCoord = xCoord - ssRadius + HexWidth;
        ssYCoord = yCoord - ssRadius+HexHeight*0.75;
        row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},3'));
        
      }

      //add bottom left for the first hexes on each row and the entire last row
      if(y===BoardHeight-1||x===0){
        ssXCoord = xCoord - ssRadius;
        ssYCoord = yCoord - ssRadius + HexHeight*0.75;
        row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},4'));
      }

      //add bottom centers for the last row of hexes
      if(y === BoardHeight-1){
        ssXCoord = xCoord - ssRadius + HexWidth*0.5;
        ssYCoord = yCoord - ssRadius+HexHeight;
        row.push(addSettleSpot(ssXCoord,ssYCoord,'s:${xCoord},${yCoord},5'));
      }

      //Add the Roads!
      const RoadWidth = 12/2
      row.push(addRoadSpot(xCoord,yCoord,"neSlant",'r:${xCoord},${yCoord},6'));
      row.push(addRoadSpot(xCoord+0.5*HexWidth,yCoord,"nwSlant",'r:${xCoord},${yCoord},1'));
      row.push(addRoadSpot(xCoord-RoadWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",'r:${xCoord},${yCoord},5'));
      if(x === 0){
        row.push(addRoadSpot(xCoord,yCoord+HexHeight*0.75,"nwSlant",'r:${xCoord},${yCoord},4'));
      }
      if(x === BoardWidth-1){
        row.push(addRoadSpot(xCoord-RoadWidth+HexWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",'r:${xCoord},${yCoord},2'));
        row.push(addRoadSpot(xCoord+0.5*HexWidth,yCoord+HexHeight*0.75,"neSlant",'r:${xCoord},${yCoord},3'));
      }
      if(y === BoardHeight - 1){
        row.push(addRoadSpot(xCoord+0.5*HexWidth,yCoord+HexHeight*0.75,"neSlant",'r:${xCoord},${yCoord},3'));
        row.push(addRoadSpot(xCoord,yCoord+HexHeight*0.75,"nwSlant",'r:${xCoord},${yCoord},4'));
      }
    }
    board.push(row);
  }

  return (
    <div className="App">
      {board}
    </div>
  );
}

function addSettleSpot(ssXCoord:number, ssYCoord:number,ssKey:string){

  return (
        <div className={`SettleSpot`} style={{
          left: ssXCoord + 'px',
          top: ssYCoord + 'px',
        }} 
        key = {ssKey} 
        >
        </div>
      );
}

function addRoadSpot(rsXCoord:number, rsYCoord:number, rDirection:string, rsKey:string){
  return (
    <div className={`RoadSpot ${rDirection}`} style={{
      left: rsXCoord + 'px',
      top: rsYCoord + 'px',
    }} key={rsKey}></div>
  );
}
