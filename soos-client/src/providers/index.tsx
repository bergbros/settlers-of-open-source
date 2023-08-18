import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

type AppProviderProps = {
  children: React.ReactNode
}

export const AppProvider = (props: AppProviderProps) => {
  return <BrowserRouter>{props.children}</BrowserRouter>
}