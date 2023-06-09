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
    }

    socket.on('playerId', receivePlayerId);

    socket.on('updateGameState', updateGameState);

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

    if (!town.display)
      continue;

    towns.push(
      <Town
        gameTown={town}
        onClick={(vertexCoords) => { if (game.onVertexClicked(vertexCoords)) sendGameStateToServer(); }}
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
    players.push(<Player player={player}></Player>);
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
      className="ActionButton"
      disabled={false}>
      {'Trade Resources'}
    </button>

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
      <div className={'p' + playerId}>My player name: {playerName}</div>
      <div>Round #0{game.turnNumber}</div>
      <div>{game.instructionText}
      </div>
      <div className="App HeaderInfo">
        {actions}
      </div>
      <div className="App HeaderInfo">
        {tradeButton}
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
      <div><button onClick={() => { game.autoPickSettlements(); game.forceUpdate() }}>{'Pick My Settlements!'}</button></div>
    </div >
  );
}
