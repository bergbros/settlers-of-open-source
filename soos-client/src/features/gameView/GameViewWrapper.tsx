import * as React from "react";
import { Socket } from 'socket.io-client';
import { Game, gameFromString } from 'soos-gamelogic';
import { GameView } from './GameView';

type GameViewWrapperProps = {
  socket: Socket;
}

export const GameViewWrapper = (props: GameViewWrapperProps) => {
  const { socket } = props;

  const [game, setGame] = React.useState<Game | undefined>(undefined);

  if (game === undefined) {
    console.log('sending retrieveGameState');
    socket.emit("retrieveGameState", (gameStateStr: string) => {
      console.log('got gamestate');
      const gameState = gameFromString(gameStateStr);
      setGame(gameState);
    });

    return <div>
      Waiting for initial game state ...
    </div>
  }
  else {
    return <GameView socket={socket} game={game}></GameView>
  }
};
