import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface IFormInput {
  username: string,
  gamecode: string,
}

export const Entry = () => {
  const { register, handleSubmit } = useForm<IFormInput>();
  const navigate = useNavigate();

  const createUserThenAction = async (username: string, callback: CallableFunction) => {
    axios.get('/api/user/create', { params: { username: username } })
      .then((response) => {
        callback(response);
      })
      .catch((error) => {
        if (error.response.status == 409) {
          console.log(error.response.data);
        }
      });
  };

  const onJoinGame: SubmitHandler<IFormInput> = (formData) => {
    let userID: string;

    createUserThenAction(formData.username, (response: any) => {
      userID = response.data;

      // Send request to determine if game exists/is joinable
      // if yes, redirect to appropriate lobby with userID as state
      // if no, error
      axios.get('/api/game/check', { params: { gamecode: formData.gamecode } },
      ).then((response) => {
        if (response.status == 204) {
          // game exists but is not joinable, explain to user
        } else {
          navigate(`/lobby/${formData.gamecode}`, {
            state: {
              userID: userID,
              name: formData.username,
            },
          });
        }
      }).catch((reason) => {
        if (reason.response.status === 404) {
          console.log('Game not found');
        }
      });
    });
  };

  const onNewGame: SubmitHandler<IFormInput> = (formData) => {
    let userID: string;

    createUserThenAction(formData.username, (response: any) => {
      userID = response.data;

      // Send request to create game, retrieve game code
      // Redirect to lobby with user ID as state
      axios.get('/api/game/new').then((response) => {
        const gamecode = response.data;

        navigate(`/lobby/${gamecode}`, {
          state: {
            userID: userID,
            name: formData.username,
          },
        });
      });
    });
  };

  return (
    <div>Entry page
      <form>
        <label htmlFor='username'>Enter user name:</label>
        <input {...register('username')} />

        <label htmlFor='gamecode'>Game code:</label>
        <input {...register('gamecode')} />

        <button type='submit' onClick={handleSubmit(onJoinGame)}>Join Game</button>
        <button type='submit' onClick={handleSubmit(onNewGame)}>New Game</button>
      </form>
    </div>
  );
};
