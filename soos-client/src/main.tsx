import React from 'react';
import ReactDOM from 'react-dom/client';

import { GameComponent } from './routes/GameCmp';
import { App } from './routes/App';
import { Lobby } from './routes/Lobby'

import { io } from 'socket.io-client';

import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

const playerId = undefined;

const socket = io();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "lobby",
    element: <Lobby socket={socket} />
  },
  {
    path: "game",
    element: <GameComponent socket={socket} />,
    errorElement: <div>It broken</div>
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
