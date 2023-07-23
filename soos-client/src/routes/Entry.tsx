import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface IFormInput {
  username: string,
  gamecode: string,
}

export function Entry() {
  const { register, handleSubmit } = useForm<IFormInput>();

  const onJoinGame: SubmitHandler<IFormInput> = (data) => {
    axios.get('/api/user/create');
  }
  const onNewGame: SubmitHandler<IFormInput> = (data) => {

  }

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
  )
}