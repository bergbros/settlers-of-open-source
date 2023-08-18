// import { GameProps } from './GameCmp';
import { setsAreEqual, printSocketMsg } from '~/src/utils';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

type LobbyProps = {
  socket: Socket
}

export const Lobby = (props: LobbyProps) => {
  const { socket } = props;
  const initialUserSet: Set<string> = new Set<string>();
  const [userSet, setUserSet] = useState(initialUserSet);
  const { state } = useLocation();
  console.log(state);


  useEffect(() => {
    function updateUserList(newUsernames: string[]) {
      // TODO change server to ensure unique usernames
      console.log('Received user list', newUsernames);

      // TODO maybe error checking to see if any duplicate names were included in the list that disappeared in the set? 
      var newUserSet = new Set(newUsernames);

      if (!setsAreEqual(userSet, newUserSet)) {
        setUserSet(newUserSet);
      }
    }

    socket.on('socketAssocError', printSocketMsg);
    socket.on('joinGameError', printSocketMsg);
    // TODO I hate this listener name, redo it
    socket.on('gameUserList', updateUserList);

    if (!state.gamecode) {
      console.log('No game code found');
    } else {
      // TODO axios.get(/api/socket/socketSecret) instead of just userID
      socket.emit('associateWithHTTP', state.userID);
      socket.emit('joinGame', state.gamecode);
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
    </div>
  )
}