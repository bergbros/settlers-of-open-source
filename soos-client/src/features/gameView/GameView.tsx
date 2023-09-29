import * as React from 'react';
import { Socket } from 'socket.io-client';
import {
  actionCostString,
  actionToString,
  AllBuildActionTypes,
  BuildAction,
  hydrateBuildAction,
  gameFromString,
  GamePhase,
  Game,
  BuildActionType,
} from 'soos-gamelogic';
import { Player } from '~/src/components';
import { Board, ResourceBar, TradeWindow } from './components';
import BoardScaler from './components/board/BoardScaler';

type GameViewProps = {
  socket: Socket;
  game: Game;
};

export const GameView = (props: GameViewProps) => {
  const { socket } = props;

  // TODO wrap this in another component and don't display placeholder
  // game when waiting for multiplayer game to start
  const [ game, setGame ] = React.useState<Game>(props.game);
  const [ playerId, setPlayerId ] = React.useState<number | undefined>(undefined);
  const [ isTradeWindowShowing, setIsTradeWindowShowing ] = React.useState<boolean>(false);
  const [ makingPremoves, setMakingPremoves ] = React.useState<boolean>(false);
  const [ currentlyBuilding, setCurrentlyBuilding ] = React.useState<BuildActionType | 'all' | undefined>(undefined);
  const [ queuedPremoves, setQueuedPremoves ] = React.useState<BuildAction[]>([]);
  // Set up force update function
  const [ count, setCount ] = React.useState<number>(0);
  game.forceUpdate = () => {
    setCount(count + 1);
  };

  React.useEffect(() => {
    function receivePlayerId(id: number) {
      if (id === undefined) {
        console.log('Error getting player id, check server logs');
      } else {
        console.log('Got player ID:', id);
        setPlayerId(id);
      }
    }

    function updateGameState(gameState: string): void {
      // parse game
      const updatedGame = gameFromString(gameState);
      updatedGame.forceUpdate = () => {
        setCount(count + 1);
      };
      setGame(updatedGame);
      setCurrentlyBuilding(undefined);
      console.log('got new game state');
      socket.emit('getPremoves');
    }

    function setPremoves(serverPremoves: BuildAction[]) {
      console.log('got premoves: ');
      console.log(serverPremoves);
      const premoves:BuildAction[] = [];
      for (const serverMove of serverPremoves) {
        premoves.push(hydrateBuildAction(serverMove));
      }
      game.premoveActions = premoves;
      setQueuedPremoves(premoves);
    }

    console.log('sending playerId');
    socket.emit('playerId', receivePlayerId);

    socket.on('updateGameState', updateGameState);
    socket.on('setPremoves', (serverPremoves)=>{
      setPremoves(serverPremoves);
      console.log(serverPremoves);
    });

    return () => {
      // socket.off("playerId", receivePlayerId);
      socket.off('updateGameState', updateGameState);
      socket.off('setPremoves', setPremoves);
    };
  }, []);

  function sendGameStateToServer() {
    socket.emit('newGameState', game.toString());
  }

  // let premoveItems = premoves.map((action: BuildAction) => (
  //   <li>{action.displayString()}</li>
  // ));
  // let premoveDisplay = (
  //   <div>
  //     <ul> Your Premoves:{premoveItems}</ul>
  //   </div>
  // );

  const dialogBoxes = [];
  if (isTradeWindowShowing && playerId !== undefined) {
    dialogBoxes.push(
      <TradeWindow
        tradeRatio={game.players[playerId].tradeRatio}
        resources={game.players[playerId].cards}
        closeWindowHandler={() => setIsTradeWindowShowing(false)}
        executeTradeHandler={(tradeIn: number, tradeFor: number) => {
          //game.executeTrade(tradeIn, tradeFor, playerId);
          //game.forceUpdate();
          socket.emit('trade', tradeIn, tradeFor);
        }}
      />,
    );
  }

  // let playerName = "waiting to connect";
  // if (playerId !== undefined) {
  //   playerName = game.players[playerId].name;
  // }

  return (
  // <div className="App">
  //   <div>You are player: {playerName}</div>
  //   <div>Round #0{game.turnNumber}</div>
  //   <div className={'p' + game.currPlayerIdx}>{game.instructionText}
  //   </div>

    <div className="Board">
      <BoardScaler>
        <Board
          socket={socket}
          game={game}
          makingPremoves={makingPremoves}
          playerId={playerId}
          currentlyBuilding={currentlyBuilding}
          queuedPremoves = {queuedPremoves}
        />
      </BoardScaler>

      {/* List of players' resource count & victory points */}
      <div className="PlayerList">
        {game.players.map((player, index) => (
          <Player
            key={index}
            playerIndex={index}
            playerName={player.name}
            isMe={player.index === playerId}
            totalResources={player.cards.reduce((prev, curr) => prev + curr)}
            victoryPoints={player.victoryPoints}
          />
        ))}
      </div>

      {playerId !== undefined && (
        <ResourceBar
          resources={game.players[playerId].cards}
          onTradeButtonClicked={() => setIsTradeWindowShowing(true)}
        />
      )}

      {/* Build & other actions */}

      <div className="BottomRightActions">
        {game.setupPhase() && (<button
          onClick={() => socket.emit('autoPickSettlements')}
          className="AutoPickSettlementsButton"
        >
          Auto Pick Settlements
        </button>)}

        <button
          onClick={() => {
            //game.nextPlayer();
            //sendGameStateToServer();
            socket.emit('nextTurn');
          }}
          className="NextTurnButton"
          disabled={game.gamePhase !== GamePhase.MainGameplay}
        >
          Next Turn
        </button>

        <div className="BuildActions">
          <div className="BuildActionsLabel">Build:</div>
          <div className="BuildActionButtons">
            {AllBuildActionTypes.map((buildActionType, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('clicked ' + buildActionType.toString());
                  if (currentlyBuilding !== undefined) {
                    // they clicked again, clear it
                    setCurrentlyBuilding(undefined);
                  }
                  if (buildActionType === BuildActionType.Road || buildActionType === BuildActionType.Settlement || buildActionType ===BuildActionType.City) {
                    setCurrentlyBuilding(buildActionType);
                  } else {
                    game.displayActionOptions(buildActionType);
                    sendGameStateToServer();
                  }
                }}
                className="ActionButton"
                disabled={!game.actionViable(buildActionType)}
              >
                <div className="label">{actionToString(buildActionType)}</div>
                <div className="cost">{actionCostString(buildActionType)}</div>
              </button>
            ))}
          </div>
          {/* premove button */}
          <button
            className="ActionButton chunky-btn"
            onClick={() => {
              if(playerId===undefined) {
                return;
              }
              if (makingPremoves) {
                game.gamePhase = GamePhase.MainGameplay;
                setCurrentlyBuilding(undefined);
              } else {
                socket.emit('getPremoves');
                setCurrentlyBuilding('all');
              }
              setMakingPremoves(!makingPremoves);
            }}
            disabled={game.setupPhase()}
          >
            {makingPremoves ? 'Done Planning' : 'Set Premoves'}
          </button>
        </div>
      </div>
      <div>{dialogBoxes}</div>
    </div>
  );
};
