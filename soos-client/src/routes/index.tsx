import * as React from 'react';
import { Entry, Lobby, GameView } from '../features';

import { io } from 'socket.io-client';
import { useRoutes } from 'react-router-dom';

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

  const element = useRoutes(routes);

  return <>{element}</>
}