import * as React from "react";
import { Socket } from "socket.io-client";
import {
  actionCostString,
  actionToString,
  AllBuildActionTypes,
  BuildAction,
  hydrateBuildAction,
  gameFromString,
  GameHex,
  GamePhase,
  RobberPhase,
  Game,
} from "soos-gamelogic";
import { Hex, Town, Road, Robber, Player } from "~/src/components";

type BoardProps = {
  game: Game;
  socket: Socket;
  makingPremoves: boolean;
  playerId?: number;
};

let premoves: BuildAction[] = [];

export const Board = (props: BoardProps) => {
  const { game, socket, makingPremoves, playerId } = props;

  function sendGameStateToServer() {
    socket.emit("newGameState", game.toString());
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
        />
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
          const actionResponse = game.onClientVertex(
            vertexCoords,
            playerId,
            makingPremoves
          );
          console.log(actionResponse);
          if (actionResponse.type === "complete") {
            sendGameStateToServer();
          } else if (actionResponse.type === "invalid") {
            socket.emit("check");
            //no action
          } else {
            socket.emit("premove", actionResponse);
          }
        }}
        key={`t:${townCoords.hexCoords.x},${townCoords.hexCoords.y},${townCoords.direction}`}
      />
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
        // isHighlighted={possibleBuildActions.any(pba => pba.edgecoords.equals(road.coords))}
        premove={makingPremoves && road.playerIdx === playerId}
        onClick={(edgeCoords) => {
          // (build road btn)
          // const [possibleBuildActions, setPossibleBuildActions] = useState<BuildAction[]>();
          // const buildActions = game.validBuildActions(player, 'road')
          // possibleBuildActions state

          // game.roads.highlighted? -> possibleBuildActions
          // use possibleBuildActions to highlight possible edges where you can build a road

          // when the player chooses one of those,
          // send buildACtion to server
          // server sends back new game state

          if (playerId === undefined) {
            return;
          }
          const actionResponse = game.onClientEdge(
            edgeCoords,
            playerId,
            makingPremoves
          );
          console.log(actionResponse);
          if (actionResponse.type === "complete") {
            sendGameStateToServer();
          } else if (actionResponse.type !== "invalid") {
            socket.emit("premove", actionResponse);
          }
        }}
        key={`r:${roadCoords.hexCoords.x},${roadCoords.hexCoords.y},${roadCoords.direction}`}
      />
    );
  }
  const robber = <Robber game={game}></Robber>;

  let premoveItems = premoves.map((action: BuildAction) => (
    <li>{action.displayString()}</li>
  ));
  let premoveDisplay = (
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
