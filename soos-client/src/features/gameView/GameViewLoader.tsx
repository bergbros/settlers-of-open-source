import axios from 'axios';
import { redirect } from 'react-router-dom';

export const GameViewLoader = async () => {
  let userIsRegistered = true;
  let userHasSocket = true;
  console.log('GameViewLoader running');

  await axios.get('/api/user/check').catch(error => {
    if (error.response.status == 404) {
      console.log('No user registered');
      userIsRegistered = false;
    }
  });

  await axios.get('/api/socket/check').catch(error => {
    if (error.response.status == 404) {
      console.log('No socket found for user');
      userHasSocket = false;
    }
  });

  if (userIsRegistered && userHasSocket) {
    return null;
  } else {
    if (!import.meta.env.VITE_DEBUG) {
      return redirect('/');
    } else {
      // If we're in debug mode, create an anonymous user so the game view page can be viewed
      // TODO implement this, leaving as no effect for now
      return redirect('/');
    }
  }
}