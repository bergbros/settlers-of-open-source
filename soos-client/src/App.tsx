import { ReactNode, useState } from 'react';
import './App.scss';

const HexWidth = 100, HexHeight = 120;
const BoardWidth = 7, BoardHeight = 7;

export default function App() {
  const board = [];
  const [clickStatement, setCS] = useState('no clicks');
  let settleSpotCount = 0; let roadSpotCount=0;
  let Terrain = [
    [ 'e', 'e', '/', '/', '/', '/', 'e' ],
    [ 'e', '/', '?', '?', '?', '/', 'e' ],
    [ 'e', '/', '?', '?', '?', '?', '/' ],
    [ '/', '?', '?', '?', '?', '?', '/' ],
    [ 'e', '/', '?', '/', '/', '?', '/' ],
    [ 'e', '/', '?', '?', '?', '/', 'e' ],
    [ 'e', 'e', '/', '/', '/', '/', 'e' ],
  ];
  let terrFrequency = [];

  function addSettleSpot(ssXCoord:number, ssYCoord:number,ssKey:string){
    settleSpotCount++;
    return (
          <div className={`SettleSpot`} style={{
            left: ssXCoord + 'px',
            top: ssYCoord + 'px',
          }} 
          key = {ssKey}
          onClick = {()=>setCS(`Clicked: ${ssKey}`)}
          >
          </div>
        );
  }

  function addRoadSpot(rsXCoord:number, rsYCoord:number, rDirection:string, rsKey:string){
    roadSpotCount++;
    return (
      <div 
      className={`RoadSpot ${rDirection}`} 
      style={{
        left: rsXCoord + 'px',
        top: rsYCoord + 'px',
      }} 
      key={rsKey}
      onClick = {()=>setCS(`Clicked: ${rsKey}`)}
      >

      </div>
    );
  }
  //three brick/ore, four wood/grain/sheep, one desert; 19 tiles
  let tilePile = ['b','b','b','o','o','o','w','w','w','w','g','g','g','g','s','s','s','s','d'];
  let numberPile = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

  for (let y = 0; y < BoardHeight; y++) {
    const isOffset: boolean = y % 2 === 1;
    const row = [];
    const freqRow = [];
    for (let x = 0; x < BoardWidth; x++) {
      let terrainClass = '';
      switch (Terrain[y][x]) {
        case 'e': terrainClass = 'empty'; break;
        case '/': terrainClass = 'water'; break;
        case '?':
          let tileIndex = 0;
          let newTile ='d'
          if (tilePile.length>1){
            tileIndex = Math.floor(Math.random() * tilePile.length);
            newTile = tilePile[tileIndex];
          }
          if (tilePile.length===1) newTile = tilePile[0];
          tilePile.splice(tileIndex,1)
          switch(newTile){
            case 'b': terrainClass = 'brick'; break;
            case 'd': terrainClass = 'desert';break;
            case 'g': terrainClass = 'grain'; break;
            case 'o': terrainClass = 'ore';   break;
            case 's': terrainClass = 'sheep'; break;
            case 'w': terrainClass = 'wood';  break;    
          }
          Terrain[y][x] = newTile;
          break;
      }

      let xCoord = x * HexWidth;
      if (isOffset) {
        xCoord += HexWidth * .5;
      }
      xCoord+=55;
      const yCoord = y * HexHeight * .75+55;

      let numberIndex = null;
      let tileNumber = null;
      if (Terrain[y][x]==='/' ||Terrain[y][x]==='d'||Terrain[y][x]==='e') {
      } else {
        numberIndex = numberPile.length>1 ? Math.floor(Math.random() * numberPile.length) : 0;
        tileNumber = numberPile.length>0 ? numberPile[numberIndex] : 0;
        if (numberPile.length>0) numberPile.splice(numberIndex,1);
      }

      freqRow.push(tileNumber);
      row.push( 
        <div 
          className={`Hex ${terrainClass}`} style={{
            left: xCoord + 'px',
            top: yCoord + 'px',
          }}
          key = {`h:${x},${y}`}
          >
            <div className="tileNumber">{tileNumber}</div>
        </div>
      );

      //add settlement spots and roads if necessary!
      if(Terrain[y][x]!=='e' && Terrain[y][x]!=='/'){
        const ssRadius = 20/2;
        let ssXCoord =  0;
        let ssYCoord = 0;
        //add top left settlement spot on each hex
        row.push(addSettleSpot(xCoord - ssRadius,yCoord - ssRadius+ HexHeight*.25,`s:${x},${y},6`));
        //add top center settlement spot on each hex
        row.push(addSettleSpot(xCoord - ssRadius + HexWidth*0.5,yCoord - ssRadius,`s:${x},${y},1`));
        //add right corners for end of row hexes
        if(Terrain[y][x+1] === '/' && y<BoardHeight/2) row.push(addSettleSpot(xCoord - ssRadius + HexWidth,yCoord - ssRadius + HexHeight*0.25,`s:${x},${y},2`));
        if(Terrain[y][x+1] === '/' && Terrain[y+1][x+(y%2)] === '/') row.push(addSettleSpot(xCoord - ssRadius + HexWidth,yCoord - ssRadius+HexHeight*0.75,`s:${x},${y},3`));  
        //add bottom left for the first hexes on each row and the last row of hexes
        if(Terrain[y+1][x-((y+1)%2)]==='/'){ row.push(addSettleSpot(xCoord - ssRadius,yCoord - ssRadius + HexHeight*0.75,`s:${x},${y},4`));}
        //add bottom center for the entire last row
        if(Terrain[y+1][x+(y%2)]==='/'){row.push(addSettleSpot(xCoord - ssRadius + HexWidth*0.5,yCoord - ssRadius+HexHeight,`s:${x},${y},5`));}
  
        //Add the Roads!
        const RoadWidth = 12/2
        row.push(addRoadSpot(xCoord+0.5*HexWidth,yCoord,"nwSlant",`r:${x},${y},1`));
        row.push(addRoadSpot(xCoord-RoadWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",`r:${x},${y},5`));
        row.push(addRoadSpot(xCoord,yCoord,"neSlant",`r:${x},${y},6`));
        
        if(Terrain[y][x+1] === '/') 
          row.push(addRoadSpot(xCoord-RoadWidth+HexWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",`r:${x},${y},2`));
        if(Terrain[y+1][x+y%2] === '/')
          row.push(addRoadSpot(xCoord+0.5*HexWidth,yCoord+HexHeight*0.75,"neSlant",`r:${x},${y},3`));
        if(Terrain[y+1][x+y%2-1] === '/') 
          row.push(addRoadSpot(xCoord,yCoord+HexHeight*0.75,"nwSlant",`r:${x},${y},4`));
        
      }
      
    }
    terrFrequency.push(freqRow)
    board.push(row);
  }
  console.log(`Terrain: ${Terrain}`);
          



  return (
    <div className="App">
      {board}
      {clickStatement}
    </div>
  );
}
