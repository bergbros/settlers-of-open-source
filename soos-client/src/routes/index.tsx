import * as React from 'react';
import {
  Entry,
  Lobby,
  GameView
} from '../features';

import { io } from 'socket.io-client';

export const AppRoutes = () => {
  const socket = io();

  const routes = [
    {
      path: "/",
      element: <Entry />,
    },
    {
      path: "/lobby",
      element: <Lobby socket={socket} />
    },
    {
      path: "/game",
      element: <GameView socket={socket} />
    },
  ]

  return routes;
}