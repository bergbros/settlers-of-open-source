import { Component, ReactNode, useState } from 'react';
import './App.scss';

const HexWidth = 100, HexHeight = 120;
const BoardWidth = 7, BoardHeight = 7;

export class App extends Component {
  constructor(props:any){
    super(props);

  }

  render(): ReactNode {
    return(
      <div className="App">
        <GameBoard></GameBoard>
      </div>
      );      
  }
}

class GameBoard extends Component<{},{board:any; clickStatement:string,myTerrain:string[][], myTerrFrequency:(number|null)[][]}>{
  constructor(props:any) {
    super(props);
    this.state = {
      myTerrain: [],
      myTerrFrequency: [],
      board:this.initializeBoard(),
      clickStatement: "Click on an object to see its properties",
    };
  }

  handleClick(clickedKey:string){
    let statement ="";
    if(clickedKey[0]==='s'){
      statement = clickedKey + this.listResources(clickedKey);
    } else{
      statement = clickedKey;
    }
    this.setState({clickStatement:`You clicked: ${statement}`});
  }
  
  render(){

    return(
      <div className="App">
        <div>{this.state.clickStatement}</div>
        <div><button>Next Turn</button></div>
        {this.state.board}        
      </div>
    );
  }
  
  addSettleSpot(ssXCoord:number, ssYCoord:number ,ssKey:string){
    return (
          <div className={`SettleSpot`} style={{
            left: ssXCoord + 'px',
            top: ssYCoord + 'px',
          }} 
          key = {ssKey}
          onClick = {()=>this.handleClick(ssKey)}
          >
          </div>
        );
  }

  addRoadSpot(rsXCoord:number, rsYCoord:number, rDirection:string, rsKey:string){
    return (
      <div 
      className={`RoadSpot ${rDirection}`} 
      style={{
        left: rsXCoord + 'px',
        top: rsYCoord + 'px',
      }} 
      key={rsKey}
      onClick = {() => this.handleClick(rsKey)}
      ></div>
    );
  }

  listResources(ssKey:string){
    let myResources = ['w'];
    const myLocation = this.parseKey(ssKey);
    //first hex is easy - it's the one listed.
    //console.log(this.state.myTerrain);
    //myResources.push(this.state.myTerrain[myLocation[1]][myLocation[0]]);
    //Second hex is the cardinal direction of the settlement
    //myResources.push(this.getHex(myLocation[0],myLocation[1],myLocation[2]));
    //third direction is that direction minus one
    //if (myLocation[2]===1)
    //  myResources.push(this.getHex(myLocation[0],myLocation[1],6));
    //else
    //  myResources.push(this.getHex(myLocation[0],myLocation[1],myLocation[2]-1));
    return myResources;
  }

  getHex(startX:number,startY:number,direction:number){
    let resX = 0; let resY = 0;
    switch(direction){
      case 1:
        resY=startY-1; resX = startX+startY%2
        break;
      case 2:
        resY=startY; resX = startX+1;
      case 3:
        resY=startY+1;resX=startX+startY%2;
      case 4:
        resY=startY+1;resX = startX+startY%2-1
      case 5:
        resY=startY; resX = startX-1;
      case 6:
        resY=startY-1;resX=startX-startY%2;
    }
    return this.state.myTerrain[resY][resX];
  }
  
  parseKey(theKey:string){
    console.log(theKey.split(/[?:,]/).splice(1).map(Number));
    return(
      theKey.split(/[?:,]/).splice(1).map(Number)
    );
  }

  initializeBoard(){

    const board = [];
    //const [clickStatement:string, setCS] = useState('no clicks');
    let settleSpotCount = 0; let roadSpotCount=0;
    let Terrain = [
      [ 'e', 'e', '/', '/', '/', '/', 'e' ],
      [ 'e', '/', '?', '?', '?', '/', 'e' ],
      [ 'e', '/', '?', '?', '?', '?', '/' ],
      [ '/', '?', '?', '?', '?', '?', '/' ],
      [ 'e', '/', '?', '?', '?', '?', '/' ],
      [ 'e', '/', '?', '?', '?', '/', 'e' ],
      [ 'e', 'e', '/', '/', '/', '/', 'e' ],
    ];
    let terrFrequency:(number|null)[][] = [];
  
    
  
    
    
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
          row.push(this.addSettleSpot(xCoord - ssRadius,yCoord - ssRadius+ HexHeight*.25,`s:${x},${y},6`));
          //add top center settlement spot on each hex
          row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth*0.5,yCoord - ssRadius,`s:${x},${y},1`));
          //add right corners for end of row hexes
          if(Terrain[y][x+1] === '/' && y<BoardHeight/2) row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth,yCoord - ssRadius + HexHeight*0.25,`s:${x},${y},2`));
          if(Terrain[y][x+1] === '/' && Terrain[y+1][x+(y%2)] === '/') row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth,yCoord - ssRadius+HexHeight*0.75,`s:${x},${y},3`));  
          //add bottom left for the first hexes on each row and the last row of hexes
          if(Terrain[y+1][x-((y+1)%2)]==='/'){ row.push(this.addSettleSpot(xCoord - ssRadius,yCoord - ssRadius + HexHeight*0.75,`s:${x},${y},4`));}
          //add bottom center for the entire last row
          if(Terrain[y+1][x+(y%2)]==='/'){row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth*0.5,yCoord - ssRadius+HexHeight,`s:${x},${y},5`));}
    
          //Add the Roads!
          const RoadWidth = 12/2
          row.push(this.addRoadSpot(xCoord+0.5*HexWidth,yCoord,"nwSlant",`r:${x},${y},1`));
          row.push(this.addRoadSpot(xCoord-RoadWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",`r:${x},${y},5`));
          row.push(this.addRoadSpot(xCoord,yCoord,"neSlant",`r:${x},${y},6`));
          
          if(Terrain[y][x+1] === '/') 
            row.push(this.addRoadSpot(xCoord-RoadWidth+HexWidth,yCoord+0.25*HexHeight+ssRadius+5,"vertical",`r:${x},${y},2`));
          if(Terrain[y+1][x+y%2] === '/')
            row.push(this.addRoadSpot(xCoord+0.5*HexWidth,yCoord+HexHeight*0.75,"neSlant",`r:${x},${y},3`));
          if(Terrain[y+1][x+y%2-1] === '/') 
            row.push(this.addRoadSpot(xCoord,yCoord+HexHeight*0.75,"nwSlant",`r:${x},${y},4`));
          
        }
        
      }
      terrFrequency.push(freqRow)
      board.push(row);
    }
    //console.log(`Terrain: ${Terrain}`);
    this.setState({myTerrain: Terrain});
    this.setState({myTerrFrequency: terrFrequency});
    //console.log(`Terrain: ${this.state.myTerrain}`);
    
    return (
      <div className="App">
        {board}
      </div>
    );
  }


}

type HexProp = {terrainClass:string, xCoord:number, yCoord:number,x:number, y:number,tileNumber:number,settlements:number[], roads:number[]}
class Hex extends Component<HexProp, {}> {
  constructor(props:any){
    super(props);
  }
  render(): ReactNode {
    const hexDivs = [];
    hexDivs.push(
      <div 
          className={`Hex ${this.props.terrainClass}`} style={{
            left: this.props.xCoord + 'px',
            top: this.props.yCoord + 'px',
          }}
          key = {`h:${this.props.x},${this.props.y}`}
          >
            <div className="tileNumber">{this.props.tileNumber}</div>
        </div>
    );


    return(hexDivs); 
  }


  
}


