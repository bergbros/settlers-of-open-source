import * as React from 'react';
import {
  Entry,
  Lobby,
  LobbyLoader,
  GameViewLoader,
  GameViewWrapper,
} from '../features';

import { io } from 'socket.io-client';

export const AppRoutes = () => {
  const socket = io();

  const routes = [
    {
      path: '/',
      element: <Entry />,
    },
    {
      path: '/lobby/:gamecode',
      element: <Lobby socket={socket} />,
      //loader: LobbyLoader
    },
    {
      path: '/game/:gamecode',
      element: <GameViewWrapper socket={socket} />,
      //loader: GameViewLoader
    },
  ];

  return routes;
};
