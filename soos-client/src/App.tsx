import { useEffect, useState } from 'react';
import { actionToString, AllBuildOptions, Game, GameHex, GamePhase, RobberPhase, gameFromString } from 'soos-gamelogic';
import { Socket } from 'socket.io-client';
import { Hex, Town, Road, Player, Robber } from './components';
import { TradeWindow } from './features/';
import './App.scss';
import { BuildAction, BuildOptions } from 'soos-gamelogic/dist/src/buildOptions';

const debugAutoPickSettlements = true;
let premoves: BuildAction[] = [];
export type AppProps = {
  socket: Socket
};

export function App(props: AppProps) {
  const { socket } = props;

  // TODO wrap this in another component and don't display placeholder
  // game when waiting for multiplayer game to start
  const [ game, setGame ] = useState<Game>(new Game({ debugAutoPickSettlements }));
  const [ playerId, setPlayerId ] = useState<number | undefined>(undefined);
  const [ isTradeWindowShowing, setIsTradeWindowShowing ] = useState<boolean>(false);
  const [ premove, setPremove ] = useState<boolean>(false);
  // Set up force update function
  const [ count, setCount ] = useState<number>(0);
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
      console.log('got new game state');
    }

    function setPremoves(serverPremoves: BuildAction[]) {
      premoves = serverPremoves;
    }

    socket.on('playerId', receivePlayerId);
    socket.on('updateGameState', updateGameState);
    socket.on('premoves', setPremoves);

    return () => {
      socket.off('playerId', receivePlayerId);
      socket.off('updateGameState', updateGameState);
    };
  }, []);

  function sendGameStateToServer() {
    socket.emit('newGameState', game.toString());
  }

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
            if (game.onHexClicked(hexCoords)) {
              sendGameStateToServer();
            }
          }}
          placeRobber={game.gamePhase === GamePhase.PlaceRobber && game.robberPhase === RobberPhase.PlaceRobber && game.currPlayerIdx === playerId}
          key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
        />,
      );
    }
  }

  for (const town of game.map.towns) {
    const townCoords = town.coords!;

    if (!town.display && !premove) {
      continue;
    }

    towns.push(
      <Town
        gameTown={town}
        premove={premove && town.playerIdx === playerId}
        onClick={(vertexCoords) => {
          if (playerId === undefined) {
            return;
          }
          const actionResponse = game.onClientVertex(vertexCoords, playerId, premove);
          console.log(actionResponse);
          if (actionResponse.type === BuildOptions.actionCompleted) {
            sendGameStateToServer();
          } else if (actionResponse.type === BuildOptions.invalidAction) {
            socket.emit('check');
            //no action
          } else {
            socket.emit('premove', actionResponse);
          }
        }}
        key={`t:${townCoords.hexCoords.x},${townCoords.hexCoords.y},${townCoords.direction}`}
      />,
    );
  }

  for (const road of game.map.roads) {
    const roadCoords = road.coords;

    if (!road.showMe() && !premove) {
      continue;
    }

    roads.push(
      <Road
        gameRoad={road}
        onClick={(edgeCoords) => {
          socket.emit('check');
          if (playerId === undefined) {
            return;
          }
          const actionResponse = game.onClientEdge(edgeCoords, playerId, premove);
          console.log(actionResponse);
          if (actionResponse.type === BuildOptions.actionCompleted) {
            sendGameStateToServer();
          } else if (actionResponse.type !== BuildOptions.invalidAction) {
            socket.emit('premove', actionResponse);
          }
        }}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />,
    );
  }

  for (const player of game.players) {
    if (player.index === playerId) {
      players.push(<Player player={player} details={true}></Player>);
    } else {
      players.push(<Player player={player} details={false}></Player>);
    }
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
      onClick={() => {
        setIsTradeWindowShowing(true);
      }}
      className="ActionButton">
      {'Trade Resources'}
    </button>;
  const premoveButton =
    <button
      className="ActionButton"
      onClick={() => {
        setPremove(!premove);
      }}>
      {premove ? 'Done Planning' : 'Set Premoves'}
    </button >;

  const premoveItems = premoves.map((action: BuildAction) => (
    <li>{action.displayString()}</li>));
  const premoveDisplay = <div> < ol > Your Premoves:{premoveItems}</ol></div>;
  const theRobber = <Robber game={game}></Robber>;
  robber.push(
    theRobber,
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
      }}></TradeWindow>);
  }

  let playerName = 'waiting to connect';
  if (playerId !== undefined) {
    playerName = game.players[playerId].name;
  }
  return (
    <div className="App">
      <div>You are player: {playerName}</div>
      <div>Round #0{game.turnNumber}</div>
      <div className={'p' + game.currPlayerIdx}>{game.instructionText}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="App HeaderInfo">
          {actions}
        </div>
        <div>
          <div className="App HeaderInfo">
            {tradeButton}
            {premoveButton}
          </div>
          <button
            onClick={() => {
              game.nextPlayer();
              sendGameStateToServer();
            }}
            className="NextTurnButton"
            disabled={game.gamePhase !== GamePhase.MainGameplay}
          >Next Turn</button>
          <div>{premoveDisplay}</div>
        </div>
        <div className="App HeaderInfo">{players}</div>

      </div>
      <div className="Board">
        {hexes}
        {towns}
        {roads}
        {robber}
      </div>
      <div>{dialogBoxes}</div>
      {game.gamePhase !== GamePhase.MainGameplay && <div><button onClick={() => {
        game.autoPickSettlements(); game.forceUpdate();
      }}>{'Pick My Settlements!'}</button></div>}
    </div >
  );
}
