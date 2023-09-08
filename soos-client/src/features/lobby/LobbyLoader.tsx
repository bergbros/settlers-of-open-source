import axios from 'axios';
import { redirect } from 'react-router-dom';

export const LobbyLoader = async () => {
  let userIsRegistered = true;
  console.log('LobbyLoader running');

  await axios.get('/api/user/check').catch(error => {
    if (error.response.status == 404) {
      console.log('No user registered');
      userIsRegistered = false;
    }
  });

  if (!userIsRegistered) {
    if (!import.meta.env.VITE_DEBUG) {
      return redirect('/');
    } else {
      // If we're in debug mode, create an anonymous user so the lobby page can be viewed
      // TODO implement this, leaving as no effect for now
      return redirect('/');
    }
  } else {
    return null;
  }
};
