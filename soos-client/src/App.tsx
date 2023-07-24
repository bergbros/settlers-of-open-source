import { useEffect, useState } from 'react';
import { actionToString, AllBuildActionTypes, Game, GameHex, GamePhase, RobberPhase, gameFromString } from 'soos-gamelogic';
import { Socket } from 'socket.io-client';
import { Hex, Town, Road, Player, Robber } from './components';
import { TradeWindow } from './features/';
import './App.scss';
import { BuildAction, BuildActionType, actionCostString, hydrateBuildAction } from 'soos-gamelogic/dist/src/build-actions';
import { hydrate } from 'react-dom';
import { ResourceBar } from './components/resource-bar';

const debugAutoPickSettlements = true;
let premoves: BuildAction[] = [];
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
  const [makingPremoves, setMakingPremoves] = useState<boolean>(false);
  // Set up force update function
  const [count, setCount] = useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    function receivePlayerId(id: number) {
      console.log('Got player ID:', id);
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
      console.log("got premoves: ");
      console.log(serverPremoves);
      premoves = [];
      for (const serverMove of serverPremoves) {
        premoves.push(hydrateBuildAction(serverMove));
      }
      game.forceUpdate();
    }


    socket.on('playerId', receivePlayerId);
    socket.on('updateGameState', updateGameState);
    socket.on('premoves', setPremoves);

    return () => {
      socket.off('playerId', receivePlayerId);
      socket.off('updateGameState', updateGameState);
      socket.off('premoves', setPremoves);
    };
  }, []);

  function sendGameStateToServer() {
    socket.emit('newGameState', game.toString());
  }

  const hexes = [];
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

  const towns = [];
  for (const town of game.map.towns) {
    const townCoords = town.coords!;

    if (!town.display && !makingPremoves) {
      continue;
    }

    towns.push(
      <Town
        gameTown={town}
        premove={makingPremoves && town.playerIdx === playerId}
        onClick={(vertexCoords) => {
          if (playerId === undefined) {
            return;
          }
          const actionResponse = game.onClientVertex(vertexCoords, playerId, makingPremoves);
          console.log(actionResponse);
          if (actionResponse.type === BuildActionType.actionCompleted) {
            sendGameStateToServer();
          } else if (actionResponse.type === BuildActionType.invalidAction) {
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

  const roads = [];
  for (const road of game.map.roads) {
    const roadCoords = road.coords;

    if (!road.showMe() && !makingPremoves) {
      continue;
    }

    roads.push(
      <Road
        gameRoad={road}
        onClick={(edgeCoords) => {
          if (playerId === undefined) {
            return;
          }
          const actionResponse = game.onClientEdge(edgeCoords, playerId, makingPremoves);
          console.log(actionResponse);
          if (actionResponse.type === BuildActionType.actionCompleted) {
            sendGameStateToServer();
          } else if (actionResponse.type !== BuildActionType.invalidAction) {
            socket.emit('premove', actionResponse);
          }
        }}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />,
    );
  }

  let premoveItems = premoves.map((action: BuildAction) => (
    <li>{action.displayString()}</li>));
  let premoveDisplay = <div> <ul> Your Premoves:{premoveItems}</ul></div>;
  const robber = <Robber game={game}></Robber>;

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

  const playerList = (
    <div className="PlayerList">
      {
        game.players.map((player, index) =>
          <Player
            playerIndex={index}
            playerName={player.name}
            isMe={player.index === playerId}
            totalResources={player.cards.reduce((prev, curr) => prev + curr)}
            victoryPoints={player.victoryPoints}
          ></Player>
        )
      }
    </div>
  );

  return (
    // <div className="App">
    //   <div>You are player: {playerName}</div>
    //   <div>Round #0{game.turnNumber}</div>
    //   <div className={'p' + game.currPlayerIdx}>{game.instructionText}
    //   </div>

    <div className="Board">
      <div className='Board__body'>
        {hexes}
        {towns}
        {roads}
        {robber}
      </div>


      {/* List of players' resource count & victory points */}
      {playerList}

      {
        playerId !== undefined ?
          <ResourceBar
            resources={game.players[playerId].cards}
            onTradeButtonClicked={() => setIsTradeWindowShowing(true)}
          ></ResourceBar> :
          null
      }

      {/* Build & other actions */}

      <div className='BottomRightActions'>

        <div className='NextTurnButtonContainer'>
          <button
            onClick={() => {
              game.nextPlayer();
              sendGameStateToServer();
            }}
            className="NextTurnButton"
            disabled={game.gamePhase !== GamePhase.MainGameplay}
          >
            Next Turn
          </button>
        </div>

        <div className='BuildActions'>
          <div className='BuildActionsLabel'>Build</div>
          <div className='BuildActionButtons'>
            {
              AllBuildActionTypes.filter(ba => ba !== BuildActionType.actionCompleted && ba !== BuildActionType.invalidAction).map(buildActionType =>
                <button
                  onClick={() => {
                    game.displayActionOptions(buildActionType);
                    sendGameStateToServer();
                  }}
                  className="ActionButton"
                  disabled={!game.actionViable(buildActionType)}>
                  <div className='label'>{actionToString(buildActionType)}</div>
                  <div className='cost'>{actionCostString(buildActionType)}</div>
                </button>
              )
            }
          </div>

          {/* premove button */}
          <button
            className="ActionButton chunky-btn"
            onClick={() => {
              if (makingPremoves)
                game.gamePhase = GamePhase.MainGameplay;
              setMakingPremoves(!makingPremoves);
            }}
            disabled={game.setupPhase()}
          >
            {makingPremoves ? 'Done Planning' : 'Set Premoves'}
          </button >

        </div>

      </div>

      <div>{dialogBoxes}</div>
    </div>
    //   <div>{premoveDisplay}</div>
    //   {game.gamePhase !== GamePhase.MainGameplay &&
    //     <div>
    //       <button onClick={() => {
    //         game.autoPickSettlements(); game.forceUpdate();
    //       }}>{'Pick My Settlements!'}</button>
    //     </div>}
    // </div >
  );
}
