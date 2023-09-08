import * as React from 'react';
import { AppProvider } from './providers';
import { AppRoutes } from './routes';
import './App.scss';

export const App = () => {
  const routes = AppRoutes();

  return (
    <AppProvider routes={routes} />
  );
};
