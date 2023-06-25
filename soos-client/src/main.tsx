import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { io } from 'socket.io-client';

const playerId = undefined;

const socket = io();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
);
