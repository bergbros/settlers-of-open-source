import * as React from 'react';
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';

type AppProviderProps = {
  routes: RouteObject[]
};

export const AppProvider = (props: AppProviderProps) => {
  const router = createBrowserRouter(props.routes);

  return <RouterProvider router={router} />;
};
