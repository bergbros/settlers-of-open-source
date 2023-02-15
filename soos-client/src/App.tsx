import { Component, ReactNode, useState } from 'react';
import { Game, HexCoords, MapHex, ResourceType, TerrainType } from 'soos-gamelogic';
import './App.scss';
import Hex from './Hex';
import Town from './Town';

const HexWidth = 100, HexHeight = 120;
const BoardWidth = 7, BoardHeight = 7;

export function App() {
  const [game, setGame] = useState<Game>(new Game());

  // Set up force update function
  const [count, setCount] = useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  }



  const hexes = [];
  const towns = [];
  const roads = [];

  for (let i = 0; i< game.myMap.board.length; i++){ 
    for (let k = 0; k < game.myMap.board[i].length; k++){
      let mapHex:MapHex = game.myMap.board[i][k];
      //console.log("translating " + mapHex.coords.x + "," + mapHex.coords.y);
      hexes.push(
        <Hex
          mapHex={mapHex}
          onClick={(hexCoords) => game.onHexClicked(hexCoords)}
        />
      );
      //console.log("adding " + mapHex.towns.length + " towns for " + mapHex.coords.x + "," + mapHex.coords.y);
      for (let i=0;i<mapHex.towns.length;i++){
        towns.push(
          <Town
            mapTown={mapHex.towns[i]}
            onClick = {(vertexCoords) => game.onVertexClicked(vertexCoords)}
          />
        );
      }
   }
  }

  // for (let i = 0; i< game.myMap.board.length; i++){ 
  //   for (let k = 0; k < game.myMap.board[i].length; k++){
  //     let mapHex:MapHex = game.myMap.board[i][k];
  //     towns.push(
  //       <Hex
  //         mapHex={mapHex}
  //         onClick={(hexCoords) => game.onHexClicked(hexCoords)}
  //       />
  //     );
  //   }
  // }

  


  return (
    <div className="App">
      <div className = "App HeaderInfo">
        {game.instructionText}
      </div>
      <div className="Board">
      {hexes}
      {towns}
      </div>
    </div>
  );
}

export class App2 extends Component<{},{phaseString:string, gamePhase:number,activePlayer:number}> {
  constructor(props:any){
    super(props);
    this.state={
      gamePhase:0,
      //phase 0: create a board
      //phase 1: assign settlements to each team
      //phase 2: ...
      phaseString:"Start Game",
      activePlayer:0,
    }
  }

  getActivePlayer(){
    return this.state.activePlayer;
  }
  getPhase(){
    return this.state.gamePhase;
  }

  handleNextGamePhase(){
    console.log("handling next Phase");
    const lastPhase = this.state.gamePhase;
    let newPString ="";
    let newPhase = lastPhase+1
    switch(lastPhase){
      case 0:
        newPString = "Place first Settlement & road Player 1";
        break;
      case 1:
        newPString = "Place first Settlement & road Player 2";
        break;
      case 2:
        newPString = "Place second Settlement & road Player 2";
        break;
      case 3:
        newPString = "Place second Settlement & road Player 1";
        break;
      default:
        newPString = "Player 1's turn!";
        newPhase = 10;
        break;    
    }
    console.log("setting state");
    this.setState({gamePhase: newPhase, phaseString:newPString});

  }

  render(): ReactNode {
    return(
      <div className="App">
        <button onClick={this.handleNextGamePhase.bind(this)}>{this.state.phaseString}</button>
        <div className="App HeaderInfo">
          <GameBoard nextPhase = {this.handleNextGamePhase} getActivePlayer = {this.getActivePlayer} getPhase = {this.getPhase}></GameBoard>
        </div>
        <div className="GameInfo"></div>
      </div>
      
      );      
  }
}

    
type PlayerProps = {
  id:string,
  playerNumber:number,
  construction:string[],
  resources:string,
  cardsInHand:string,
  playedCards:string,
}

//extends Component<{id:string, settlements:any[],roads:any[],resources:string,cardsInHand:string,playedCards:string},{}>
function createPlayer(aPlayerNumber:number):PlayerProps {
  return {
    id: "",
    playerNumber: aPlayerNumber,
    construction:[""],
    resources:"ONLY",
    cardsInHand:"A",
    playedCards:"TEST",
  };
}
function addSettlementToPlayer(rsKey:string, origPlayer:PlayerProps):PlayerProps{
  const myConstructs = origPlayer.construction;
  myConstructs.push(rsKey);
  return {
    id: origPlayer.id,
    playerNumber: origPlayer.playerNumber,
    construction: myConstructs,
    resources:"ONLY",
    cardsInHand:"A",
    playedCards:"TEST",
  };
}


class GameBoard extends Component<{nextPhase:Function; getActivePlayer:Function, getPhase:Function},
{board:any; clickStatement:string,myTerrain:string[][], 
  myTerrFrequency:(number|null)[][],myPlayers:PlayerProps[]}>{
  constructor(props:any) {
    super(props);
    this.state = {
      myTerrain: [
        [ 'e', 'e', '/', '/', '/', '/', 'e' ],
        [ 'e', '/', '?', '?', '?', '/', 'e' ],
        [ 'e', '/', '?', '?', '?', '?', '/' ],
        [ '/', '?', '?', '?', '?', '?', '/' ],
        [ 'e', '/', '?', '?', '?', '?', '/' ],
        [ 'e', '/', '?', '?', '?', '/', 'e' ],
        [ 'e', 'e', '/', '/', '/', '/', 'e' ],
      ],
      myTerrFrequency: [],
      board:[],//this.initializeBoard(),
      clickStatement: "Click on an object to see its properties",
      myPlayers:[],
    };
  }

  handleClick(clickedKey:string){
    let statement ="";
    if(clickedKey[0]==='s' && this.props.getPhase()<10){
      this.state.myPlayers[this.props.getActivePlayer()]
      statement = clickedKey + this.listResources(clickedKey);
    } else{
      statement = clickedKey;
    }

    this.setState({clickStatement:`You clicked: ${statement}`});
    //console.log(e.target);
    //return(e.preventDefault());
  }
  
  render(){

    return(
      <div className="App HeaderInfo">
        <div>{this.state.clickStatement}</div>
        <div className="App HeaderInfo">
        <div><button onClick={()=>this.setState({board:this.initializeBoard()})}>New Board</button></div>
        </div>
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
    let myResources = ['resources:'];
    const myLocation = this.parseKey(ssKey);
    //first hex is easy - it's the one listed.
    myResources.push(this.state.myTerrain[myLocation[1]][myLocation[0]]);
    //Second hex is the cardinal direction of the settlement
    myResources.push(this.getHex(myLocation[0],myLocation[1],myLocation[2]));
    //third direction is that direction minus one
    if (myLocation[2]===1)
      myResources.push(this.getHex(myLocation[0],myLocation[1],6));
    else
      myResources.push(this.getHex(myLocation[0],myLocation[1],myLocation[2]-1));
    return myResources;
  }

  getHex(startX:number,startY:number,direction:number){
    let resX = 0; let resY = 0;
    switch(direction){
      case 1:
        resY=startY-1; resX = startX+startY%2
        break;
      case 2:
        resY=startY; resX = startX+1;break;
      case 3:
        resY=startY+1;resX=startX+startY%2;break;
      case 4:
        resY=startY+1;resX = startX+startY%2-1;break;
      case 5:
        resY=startY; resX = startX-1;break;
      case 6:
        resY=startY-1;resX=startX-(startY+1)%2;break;
    }
    //console.log(resX + "," + resY);
    return this.state.myTerrain[resY][resX];
  }
  
  parseKey(theKey:string){
    //console.log(theKey.split(/[?:,]/).splice(1).map(Number));
    return(
      theKey.split(/[?:,]/).splice(1).map(Number)
    );
  }

  initializeBoard(){

    const board = [];
    //const [clickStatement:string, setCS] = useState('no clicks');
    let settleSpotCount = 0;
    let roadSpotCount=0;
    console.log("test");
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
    console.log(Terrain);
    
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
    this.setState({myTerrain: Terrain, myTerrFrequency: terrFrequency});
    //console.log(`Terrain: ${this.state.myTerrain}`);
    
    for(let i=1;i<4;i++){
        let newPlayer = createPlayer(i);
        this.state.myPlayers.push(newPlayer);
    }



    return (
      <div className="App HeaderInfo">
        <div className="App HeaderInfo">
          <ol>{this.listPlayers()}</ol>
        </div>
        <div className='GameBoard'>{board}</div>
      </div>
    );
  }

  listPlayers(){
    const mylist = [];
    for (let i = 0; i<this.state.myPlayers.length; i++){
      let plyr = this.state.myPlayers[i];
      mylist.push(
        <li key={i} className = "Player">
          {plyr.id} player number {plyr.playerNumber}
          <br/> Resources: {plyr.resources}
        </li>
      );
    }

    return mylist;
    //return this.state.myPlayers.map((plyr:Player)=>{
    //<li>{plyr}</li>
    //  });
  }
}

// type HexProp = {terrainClass:string, xCoord:number, yCoord:number,x:number, y:number,tileNumber:number,settlements:number[], roads:number[]}
// class Hex extends Component<HexProp, {}> {
//   constructor(props:any){
//     super(props);
//   }

//   render(): ReactNode {
//     const hexDivs = [];
//     hexDivs.push(
//       <div 
//           className={`Hex ${this.props.terrainClass}`} style={{
//             left: this.props.xCoord + 'px',
//             top: this.props.yCoord + 'px',
//           }}
//           key = {`h:${this.props.x},${this.props.y}`}
//           >
//             <div className="tileNumber">{this.props.tileNumber}</div>
//         </div>
//     );


//     return(hexDivs); 
//   }


  
// }


