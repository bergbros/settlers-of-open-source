/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import { SOOSGame } from 'soos-gamelogic';
import axios from 'axios';

function App() {
  const [ serverResult, setServerResult ] = useState<string>('loading');

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('/api/result');
      setServerResult(result.data as string);
    };

    fetchData().catch(err => {
      console.error(err);
      setServerResult('error! ' + err);
    });
  }, []);

  const game = new SOOSGame();

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p>
        In-browser game logic result: {game.playGame()}
      </p>
      <p>
        Server game logic result: {serverResult}
      </p>
    </div>
  );
}

export default App;
