import { useEffect, useState } from 'react';
import { actionToString, AllBuildOptions, Game, GameHex, GamePhase, RobberPhase, gameFromString, AllResourceTypes, resourceToString } from 'soos-gamelogic';
import './App.scss';
import Hex from './Hex';
import Player from './Player';
import Road from './Road';
import Robber from './Robber';
import Town from './Town';
import { Socket } from 'socket.io-client';
import TradeWindow from './Trade-window';

const debugAutoPickSettlements = true;
const premoves: string[] = [];
export type AppProps = {
  socket: Socket
};

export function App(props: AppProps) {
  const { socket } = props;

  // TODO wrap this in another component and don't display placeholder
  // game when waiting for multiplayer game to start
  const [game, setGame] = useState<Game>(new Game({ debugAutoPickSettlements }));
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [isTradeWindowShowing, setIsTradeWindowShowing] = useState<boolean>(false);
  const [premove, setPremove] = useState<boolean>(false);
  // Set up force update function
  const [count, setCount] = useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    function receivePlayerId(id: number) {
      setPlayerId(id);
    }

    function updateGameState(gameState: string) {
      // parse game
      const updatedGame = gameFromString(gameState);

      updatedGame.forceUpdate = () => {
        setCount(count + 1);
      };

      setGame(updatedGame);
      console.log("got new game state");
    }
    function addPremove(serverJSON: string) {
      premoves.push(serverJSON);
    }

    socket.on('playerId', receivePlayerId);

    socket.on('updateGameState', updateGameState);

    socket.on('addedPremove', addPremove);

    return () => {
      socket.off('playerId', receivePlayerId);
      socket.off('updateGameState', updateGameState);
    }
  }, []);

  function sendGameStateToServer() {
    socket.emit("newGameState", game.toString());
  };

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
          onClick={(hexCoords) => {
            if (game.onHexClicked(hexCoords)) sendGameStateToServer();
          }}
          placeRobber={game.gamePhase === GamePhase.PlaceRobber && game.robberPhase === RobberPhase.PlaceRobber && game.currPlayerIdx === playerId}
          key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
        />
      );
    }
  }

  for (const town of game.map.towns) {
    const townCoords = town.coords!;

    if (!town.display && !premove)
      continue;

    towns.push(
      <Town
        gameTown={town}
        premove={premove && town.playerIdx === playerId}
        onClick={(vertexCoords) => {
          const gameResponse = game.onClientVertex(vertexCoords, premove);
          if (!gameResponse)
            return;
          else if (gameResponse === 'true')
            sendGameStateToServer();
          else {
            console.log(gameResponse);
            socket.emit("premove", gameResponse.toString());
          }
        }}
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
        onClick={(edgeCoords) => { if (game.onEdgeClicked(edgeCoords)) sendGameStateToServer(); }}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />
    );
  }

  for (const player of game.players) {
    if (player.index === playerId)
      players.push(<Player player={player} details={true}></Player>);
    else
      players.push(<Player player={player} details={false}></Player>);
  }

  for (const option of AllBuildOptions) {
    actions.push(
      <button
        onClick={() => {
          game.executeAction(option);
          sendGameStateToServer();
        }}
        className="ActionButton"
        disabled={!game.actionViable(option)}>
        {actionToString(option)}
      </button>);
  }

  const tradeButton =
    <button
      onClick={() => { setIsTradeWindowShowing(true) }}
      className="ActionButton">
      {'Trade Resources'}
    </button>
  const premoveButton =
    <button
      className="ActionButton"
      onClick={() => {
        setPremove(!premove)
      }}>
      {premove ? "Done Planning" : 'Set Premoves'}
    </button >
  const checkButton = <button
    className="ActionButton"
    onClick={() => { socket.emit('check'); socket.emit('premove', '{"townLevel":0,"eval":5.1875,"display":false,"highlighted":false,"production":[0,0,0,0,3],"coords":{"hexCoords":{"x":3,"y":6},"direction":5}}'); }}
  >Check Me</button>
  const logPremoves = <button
    className="ActionButton"
    onClick={() => { socket.emit('logPremoves'); }}
  >Log Premoves</button>

  let theRobber = <Robber game={game}></Robber>;
  robber.push(
    theRobber
  );

  const dialogBoxes = [];
  if (isTradeWindowShowing && playerId !== undefined) {
    dialogBoxes.push(<TradeWindow
      tradeRatio={game.players[playerId].tradeRatio}
      resources={game.players[playerId].cards}
      closeWindowHandler={() => setIsTradeWindowShowing(false)}
      executeTradeHandler={(tradeIn: number, tradeFor: number) => {
        game.executeTrade(tradeIn, tradeFor, playerId);
        game.forceUpdate();
      }}></TradeWindow>)
  }
  // const tradeOptions = [];
  // if (playerId !== undefined) {
  //   for (const resource of AllResourceTypes) {
  //     tradeOptions.push(<button className="ActionButton" disabled={false}>{'Trade ' + game.players[playerId].tradeRatio[resource] + ' ' + resourceToString(resource)}</button>);
  //   }
  // }
  // dialogBoxes.push(
  //   <div id="tradeModal" className="modal">
  //     <div className="modal-content">
  //       <div className="modal-header">
  //         <span className="close">&times;</span>
  //         <h2>Available Trades:</h2>
  //       </div>
  //       <div className="modal-body">
  //         <div className="TradeInButtons">{tradeOptions}</div>
  //         <div className="TradeForSelector"></div>
  //       </div>
  //     </div>
  //   </div>
  // );


  let playerName = "waiting to connect";
  if (playerId !== undefined) playerName = game.players[playerId!].name;
  return (
    <div className="App">
      <div>You are player: {playerName}</div>
      <div>Round #0{game.turnNumber}</div>
      <div className={'p' + game.currPlayerIdx}>{game.instructionText}
      </div>
      <div className="App HeaderInfo">
        {actions}
      </div>
      <div className="App HeaderInfo">
        {tradeButton}
        {premoveButton}
        {checkButton}
        {logPremoves}
      </div>
      <button
        onClick={() => {
          game.nextPlayer();
          sendGameStateToServer();
        }}
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
      <div>{dialogBoxes}</div>
      {game.gamePhase !== GamePhase.MainGameplay && <div><button onClick={() => { game.autoPickSettlements(); game.forceUpdate() }}>{'Pick My Settlements!'}</button></div>}
    </div >
  );
}
