import { Socket } from 'socket.io-client';
import {
  BuildAction,
  GameHex,
  GamePhase,
  RobberPhase,
  Game,
  BuildActionType,
} from 'soos-gamelogic';
import { BuildSettlementAction } from 'soos-gamelogic/dist/src/build-actions';
import { Hex, Town, Road, Robber } from '~/src/components';

type BoardProps = {
  game: Game;
  socket: Socket;
  makingPremoves: boolean;
  playerId?: number;
  possibleBuildActions: BuildAction[];
};

const premoves: BuildAction[] = [];

export const Board = (props: BoardProps) => {
  const { game, socket, makingPremoves, playerId, possibleBuildActions } = props;

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
          placeRobber={
            game.gamePhase === GamePhase.PlaceRobber &&
            game.robberPhase === RobberPhase.PlaceRobber &&
            game.currPlayerIdx === playerId
          }
          key={`h:${gameHex.coords.x},${gameHex.coords.y}`}
        />,
      );
    }
  }

  const townBuildActions = possibleBuildActions.filter(pba => pba.type === BuildActionType.Settlement || pba.type === BuildActionType.City);
  console.log("town build actions: " + townBuildActions.length);
  const isSettlementSetup = game.setupPhase() && game.currPlayerIdx === playerId && !game.claimedSettlement;

  const towns = [];
  for (const town of game.map.towns) {
    if (!town || !town.coords) {
      continue;
    }

    const townCoords = town.coords;

    let buildAction: BuildAction | undefined;
    if (isSettlementSetup) {
      buildAction = new BuildSettlementAction(playerId, townCoords);
    } else {
      // TODO optimize
      buildAction = townBuildActions.find(pba => townCoords.equals(pba.location));
      if(buildAction!==undefined) console.log('Found build action for location: ' + townCoords.toString());
    }

    towns.push(
      <Town
        gameTown={town}
        highlighted={!!buildAction}
        premove={makingPremoves && town.playerIdx === playerId}
        onClick={() => {
          if (buildAction) {
            socket.emit('build', buildAction);
          }
        }}
        key={`t:${townCoords.hexCoords.x},${townCoords.hexCoords.y},${townCoords.direction}`}
      />,
    );
  }

  let roadBuildActions = possibleBuildActions.filter(pba => pba.type === BuildActionType.Road);

  if (playerId!==undefined && ((game.gamePhase === GamePhase.PlaceSettlement1 || game.gamePhase === GamePhase.PlaceSettlement2)
    && game.currPlayerIdx === playerId
    && game.claimedSettlement) || makingPremoves) {
    // custom roadBuildActions for setup phase
    roadBuildActions = game.getValidBuildActions(playerId, BuildActionType.Road);
  }
  for (const premoveAction of premoves){
    if(premoveAction.type===BuildActionType.Road)
      roadBuildActions.push(premoveAction);
  }

  const roads = [];
  for (const road of game.map.roads) {
    const roadCoords = road.coords;

    // TODO optimize
    const buildAction = roadBuildActions.find(pba => road.coords.equals(pba.location));

    roads.push(
      <Road
        gameRoad={road}
        highlighted={!!buildAction}
        premove={false && makingPremoves && road.playerIdx === playerId}
        onClick={() => {
          if (buildAction) {
            if(makingPremoves){
              socket.emit('premove', buildAction);
            } else {
              socket.emit('build', buildAction);
            }
          }
        }}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />,
    );
  }
  const robber = <Robber game={game}></Robber>;

  const premoveItems = premoves.map((action: BuildAction) => (
    <li>{action.displayString()}</li>
  ));
  const premoveDisplay = (
    <div>
      <ul> Your Premoves:{premoveItems}</ul>
    </div>
  );

  return (
    <div className="Board__body">
      {hexes}
      {towns}
      {roads}
      {robber}
    </div>
  );
};
