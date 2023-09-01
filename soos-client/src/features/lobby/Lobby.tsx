// import { GameProps } from './GameCmp';
import { setsAreEqual, printSocketMsg } from '~/src/utils';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

type LobbyProps = {
  socket: Socket
}

function launchGame(socket: Socket) {
  socket.emit('launchGame');
}

export const Lobby = (props: LobbyProps) => {
  const { socket } = props;
  const initialUserSet: Set<string> = new Set<string>();
  const [userSet, setUserSet] = useState(initialUserSet);
  const { state } = useLocation();
  const { gamecode } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    function updateUserList(newUsernames: string[]) {
      console.log('Received user list', newUsernames);

      // TODO maybe error checking to see if any duplicate names were included in the list that disappeared in the set? 
      // Shouldn't ever happen because usernames are unique
      var newUserSet = new Set(newUsernames);

      if (!setsAreEqual(userSet, newUserSet)) {
        setUserSet(newUserSet);
      }
    }

    function gameLaunch() {
      console.log('Game launching...');
      // setTimeout(() => {
      navigate(`/game/${gamecode}`);
      // }, 5000)
    }

    socket.on('socketAssocError', printSocketMsg);
    socket.on('joinGameError', printSocketMsg);
    // TODO I hate this listener name, redo it
    socket.on('gameUserList', updateUserList);
    socket.on('gameLaunch', gameLaunch);

    if (!gamecode) {
      console.log('No game code found');
    } else {
      // TODO axios.get(/api/socket/socketSecret) instead of just userID
      console.log('game code found');
      console.log('associatingWithHTTP ' + state.userID)
      socket.emit('associateWithHTTP', state.userID);
      socket.emit('joinGame', gamecode);
    }

    return () => {
      socket.off('socketAssocError', printSocketMsg);
      socket.off('joinGameError', printSocketMsg);
      socket.off('gameUserList', updateUserList);
    }
  }, []);

  return (
    <div>Lobby page <br />
      <div>Connected Users: <br />
        <ul>
          {[...userSet].map((data) => {
            return (
              <li key={data}>
                {data}
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <button type='submit'
          onClick={() => launchGame(socket)}>
          Launch Game!
        </button>
      </div>
    </div>
  )
}
