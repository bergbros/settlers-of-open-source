// export class App2 extends Component<{}, { phaseString: string, gamePhase: number, activePlayer: number }> {
//     constructor(props: any) {
//       super(props);
//       this.state = {
//         gamePhase: 0,
//         //phase 0: create a board
//         //phase 1: assign settlements to each team
//         //phase 2: ...
//         phaseString: 'Start Game',
//         activePlayer: 0,
//       };
//     }
  
//     getActivePlayer() {
//       return this.state.activePlayer;
//     }
//     getPhase() {
//       return this.state.gamePhase;
//     }
  
//     handleNextGamePhase() {
//       console.log('handling next Phase');
//       const lastPhase = this.state.gamePhase;
//       let newPString = '';
//       let newPhase = lastPhase + 1;
//       switch (lastPhase) {
//         case 0:
//           newPString = 'Place first Settlement & road Player 1';
//           break;
//         case 1:
//           newPString = 'Place first Settlement & road Player 2';
//           break;
//         case 2:
//           newPString = 'Place second Settlement & road Player 2';
//           break;
//         case 3:
//           newPString = 'Place second Settlement & road Player 1';
//           break;
//         default:
//           newPString = 'Player 1\'s turn!';
//           newPhase = 10;
//           break;
//       }
//       console.log('setting state');
//       this.setState({ gamePhase: newPhase, phaseString: newPString });
  
//     }
  
//     render(): ReactNode {
//       return (
//         <div className="App">
//           <button onClick={this.handleNextGamePhase.bind(this)}>{this.state.phaseString}</button>
//           <div className="App HeaderInfo">
//             <GameBoard nextPhase={this.handleNextGamePhase} getActivePlayer={this.getActivePlayer} getPhase={this.getPhase}></GameBoard>
//           </div>
//           <div className="GameInfo"></div>
//         </div>
  
//       );
//     }
//   }
  
//   type PlayerProps = {
//     id: string,
//     playerNumber: number,
//     construction: string[],
//     resources: string,
//     cardsInHand: string,
//     playedCards: string,
//   };
  
//   //extends Component<{id:string, settlements:any[],roads:any[],resources:string,cardsInHand:string,playedCards:string},{}>
//   function createPlayer(aPlayerNumber: number): PlayerProps {
//     return {
//       id: '',
//       playerNumber: aPlayerNumber,
//       construction: [''],
//       resources: 'ONLY',
//       cardsInHand: 'A',
//       playedCards: 'TEST',
//     };
//   }
//   function addSettlementToPlayer(rsKey: string, origPlayer: PlayerProps): PlayerProps {
//     const constructs = origPlayer.construction;
//     constructs.push(rsKey);
//     return {
//       id: origPlayer.id,
//       playerNumber: origPlayer.playerNumber,
//       construction: constructs,
//       resources: 'ONLY',
//       cardsInHand: 'A',
//       playedCards: 'TEST',
//     };
//   }
  
//   class GameBoard extends Component<{ nextPhase: Function; getActivePlayer: Function, getPhase: Function },
//     {
//       board: any; clickStatement: string, terrain: string[][],
//       terrFrequency: (number | null)[][], players: PlayerProps[]
//     }>{
//     constructor(props: any) {
//       super(props);
//       this.state = {
//         terrain: [
//           ['e', 'e', '/', '/', '/', '/', 'e'],
//           ['e', '/', '?', '?', '?', '/', 'e'],
//           ['e', '/', '?', '?', '?', '?', '/'],
//           ['/', '?', '?', '?', '?', '?', '/'],
//           ['e', '/', '?', '?', '?', '?', '/'],
//           ['e', '/', '?', '?', '?', '/', 'e'],
//           ['e', 'e', '/', '/', '/', '/', 'e'],
//         ],
//         terrFrequency: [],
//         board: [], //this.initializeBoard(),
//         clickStatement: 'Click on an object to see its properties',
//         players: [],
//       };
//     }
  
//     handleClick(clickedKey: string) {
//       let statement = '';
//       if (clickedKey[0] === 's' && this.props.getPhase() < 10) {
//         this.state.players[this.props.getActivePlayer()];
//         statement = clickedKey + this.listResources(clickedKey);
//       } else {
//         statement = clickedKey;
//       }
  
//       this.setState({ clickStatement: `You clicked: ${statement}` });
//       //console.log(e.target);
//       //return(e.preventDefault());
//     }
  
//     render() {
  
//       return (
//         <div className="App HeaderInfo">
//           <div>{this.state.clickStatement}</div>
//           <div className="App HeaderInfo">
//             <div><button onClick={() => this.setState({ board: this.initializeBoard() })}>New Board</button></div>
//           </div>
//           {this.state.board}
//         </div>
//       );
//     }
  
//     addSettleSpot(ssXCoord: number, ssYCoord: number, ssKey: string) {
//       return (
//         <div className={'SettleSpot'} style={{
//           left: ssXCoord + 'px',
//           top: ssYCoord + 'px',
//         }}
//           key={ssKey}
//           onClick={() => this.handleClick(ssKey)}
//         >
//         </div>
//       );
//     }
  
//     addRoadSpot(rsXCoord: number, rsYCoord: number, rDirection: string, rsKey: string) {
//       return (
//         <div
//           className={`RoadSpot ${rDirection}`}
//           style={{
//             left: rsXCoord + 'px',
//             top: rsYCoord + 'px',
//           }}
//           key={rsKey}
//           onClick={() => this.handleClick(rsKey)}
//         ></div>
//       );
//     }
  
//     listResources(ssKey: string) {
//       const resources = ['resources:'];
//       const location = this.parseKey(ssKey);
//       //first hex is easy - it's the one listed.
//       resources.push(this.state.terrain[location[1]][location[0]]);
//       //Second hex is the cardinal direction of the settlement
//       resources.push(this.getHex(location[0], location[1], location[2]));
//       //third direction is that direction minus one
//       if (location[2] === 1) {
//         resources.push(this.getHex(location[0], location[1], 6));
//       } else {
//         resources.push(this.getHex(location[0], location[1], location[2] - 1));
//       }
//       return resources;
//     }
  
//     getHex(startX: number, startY: number, direction: number) {
//       let resX = 0; let resY = 0;
//       switch (direction) {
//         case 1:
//           resY = startY - 1; resX = startX + startY % 2;
//           break;
//         case 2:
//           resY = startY; resX = startX + 1; break;
//         case 3:
//           resY = startY + 1; resX = startX + startY % 2; break;
//         case 4:
//           resY = startY + 1; resX = startX + startY % 2 - 1; break;
//         case 5:
//           resY = startY; resX = startX - 1; break;
//         case 6:
//           resY = startY - 1; resX = startX - (startY + 1) % 2; break;
//       }
//       //console.log(resX + "," + resY);
//       return this.state.terrain[resY][resX];
//     }
  
//     parseKey(theKey: string) {
//       //console.log(theKey.split(/[?:,]/).splice(1).map(Number));
//       return (
//         theKey.split(/[?:,]/).splice(1).map(Number)
//       );
//     }
  
//     initializeBoard() {
  
//       const board = [];
//       //const [clickStatement:string, setCS] = useState('no clicks');
//       const settleSpotCount = 0;
//       const roadSpotCount = 0;
//       console.log('test');
//       const Terrain = [
//         ['e', 'e', '/', '/', '/', '/', 'e'],
//         ['e', '/', '?', '?', '?', '/', 'e'],
//         ['e', '/', '?', '?', '?', '?', '/'],
//         ['/', '?', '?', '?', '?', '?', '/'],
//         ['e', '/', '?', '?', '?', '?', '/'],
//         ['e', '/', '?', '?', '?', '/', 'e'],
//         ['e', 'e', '/', '/', '/', '/', 'e'],
//       ];
//       const terrFrequency: (number | null)[][] = [];
//       console.log(Terrain);
  
//       //three brick/ore, four wood/grain/sheep, one desert; 19 tiles
//       const tilePile = ['b', 'b', 'b', 'o', 'o', 'o', 'w', 'w', 'w', 'w', 'g', 'g', 'g', 'g', 's', 's', 's', 's', 'd'];
//       const numberPile = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  
//       for (let y = 0; y < BoardHeight; y++) {
//         const isOffset: boolean = y % 2 === 1;
//         const row = [];
//         const freqRow = [];
//         for (let x = 0; x < BoardWidth; x++) {
//           let terrainClass = '';
//           switch (Terrain[y][x]) {
//             case 'e': terrainClass = 'empty'; break;
//             case '/': terrainClass = 'water'; break;
//             case '?':
//               let tileIndex = 0;
//               let newTile = 'd';
//               if (tilePile.length > 1) {
//                 tileIndex = Math.floor(Math.random() * tilePile.length);
//                 newTile = tilePile[tileIndex];
//               }
//               if (tilePile.length === 1) {
//                 newTile = tilePile[0];
//               }
//               tilePile.splice(tileIndex, 1);
//               switch (newTile) {
//                 case 'b': terrainClass = 'brick'; break;
//                 case 'd': terrainClass = 'desert'; break;
//                 case 'g': terrainClass = 'grain'; break;
//                 case 'o': terrainClass = 'ore'; break;
//                 case 's': terrainClass = 'sheep'; break;
//                 case 'w': terrainClass = 'wood'; break;
//               }
//               Terrain[y][x] = newTile;
//               break;
//           }
  
//           let xCoord = x * HexWidth;
//           if (isOffset) {
//             xCoord += HexWidth * .5;
//           }
//           xCoord += 55;
//           const yCoord = y * HexHeight * .75 + 55;
  
//           let numberIndex = null;
//           let tileNumber = null;
//           if (Terrain[y][x] === '/' || Terrain[y][x] === 'd' || Terrain[y][x] === 'e') {
//           } else {
//             numberIndex = numberPile.length > 1 ? Math.floor(Math.random() * numberPile.length) : 0;
//             tileNumber = numberPile.length > 0 ? numberPile[numberIndex] : 0;
//             if (numberPile.length > 0) {
//               numberPile.splice(numberIndex, 1);
//             }
//           }
  
//           freqRow.push(tileNumber);
//           row.push(
//             <div
//               className={`Hex ${terrainClass}`} style={{
//                 left: xCoord + 'px',
//                 top: yCoord + 'px',
//               }}
//               key={`h:${x},${y}`}
//             >
//               <div className="tileNumber">{tileNumber}</div>
//             </div>,
//           );
  
//           //add settlement spots and roads if necessary!
//           if (Terrain[y][x] !== 'e' && Terrain[y][x] !== '/') {
//             const ssRadius = 20 / 2;
//             const ssXCoord = 0;
//             const ssYCoord = 0;
//             //add top left settlement spot on each hex
//             row.push(this.addSettleSpot(xCoord - ssRadius, yCoord - ssRadius + HexHeight * .25, `s:${x},${y},6`));
//             //add top center settlement spot on each hex
//             row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth * 0.5, yCoord - ssRadius, `s:${x},${y},1`));
//             //add right corners for end of row hexes
//             if (Terrain[y][x + 1] === '/' && y < BoardHeight / 2) {
//               row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth, yCoord - ssRadius + HexHeight * 0.25, `s:${x},${y},2`));
//             }
//             if (Terrain[y][x + 1] === '/' && Terrain[y + 1][x + (y % 2)] === '/') {
//               row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth, yCoord - ssRadius + HexHeight * 0.75, `s:${x},${y},3`));
//             }
//             //add bottom left for the first hexes on each row and the last row of hexes
//             if (Terrain[y + 1][x - ((y + 1) % 2)] === '/') {
//               row.push(this.addSettleSpot(xCoord - ssRadius, yCoord - ssRadius + HexHeight * 0.75, `s:${x},${y},4`));
//             }
//             //add bottom center for the entire last row
//             if (Terrain[y + 1][x + (y % 2)] === '/') {
//               row.push(this.addSettleSpot(xCoord - ssRadius + HexWidth * 0.5, yCoord - ssRadius + HexHeight, `s:${x},${y},5`));
//             }
  
//             //Add the Roads!
//             const RoadWidth = 12 / 2;
//             row.push(this.addRoadSpot(xCoord + 0.5 * HexWidth, yCoord, 'nwSlant', `r:${x},${y},1`));
//             row.push(this.addRoadSpot(xCoord - RoadWidth, yCoord + 0.25 * HexHeight + ssRadius + 5, 'vertical', `r:${x},${y},5`));
//             row.push(this.addRoadSpot(xCoord, yCoord, 'neSlant', `r:${x},${y},6`));
  
//             if (Terrain[y][x + 1] === '/') {
//               row.push(this.addRoadSpot(xCoord - RoadWidth + HexWidth, yCoord + 0.25 * HexHeight + ssRadius + 5, 'vertical', `r:${x},${y},2`));
//             }
//             if (Terrain[y + 1][x + y % 2] === '/') {
//               row.push(this.addRoadSpot(xCoord + 0.5 * HexWidth, yCoord + HexHeight * 0.75, 'neSlant', `r:${x},${y},3`));
//             }
//             if (Terrain[y + 1][x + y % 2 - 1] === '/') {
//               row.push(this.addRoadSpot(xCoord, yCoord + HexHeight * 0.75, 'nwSlant', `r:${x},${y},4`));
//             }
  
//           }
  
//         }
//         terrFrequency.push(freqRow);
//         board.push(row);
//       }
//       this.setState({ terrain: Terrain, terrFrequency: terrFrequency });
  
//       for (let i = 1; i < 4; i++) {
//         const newPlayer = createPlayer(i);
//         this.state.players.push(newPlayer);
//       }
  
//       return (
//         <div className="App HeaderInfo">
//           <div className="App HeaderInfo">
//             <ol>{this.listPlayers()}</ol>
//           </div>
//           <div className='GameBoard'>{board}</div>
//         </div>
//       );
//     }
  
//     listPlayers() {
//       const mylist = [];
//       for (let i = 0; i < this.state.players.length; i++) {
//         const plyr = this.state.players[i];
//         mylist.push(
//           <li key={i} className="Player">
//             {plyr.id} player number {plyr.playerNumber}
//             <br /> Resources: {plyr.resources}
//           </li>,
//         );
//       }
  
//       return mylist;
//     }
//   }
  