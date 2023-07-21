import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './routes/App';
import { Entry } from './routes/Entry';
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
    path: "/game",
    element: <App socket={socket} />,
    errorElement: <div>It broken</div>
  },
  {
    path: "/",
    element: <Entry />
  },
  {
    path: "/lobby",
    element: <Lobby />
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
