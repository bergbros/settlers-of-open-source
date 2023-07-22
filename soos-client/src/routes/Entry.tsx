import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Entry() {
  const [formData, setFormData] = useState({ username: '', gamecode: '' });

  const handleChange = (event: any) => {
    const { name, value } = event.currentTarget;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  }

  const handleSubmit = async (event: any) => {
    // Send info to the server
    // Get info about game state (lobby/play)
    //      -- implement this last
    // Navigate to appropriate page
    event.preventDefault();
    console.log(formData);

    await axios.post('/api/user/create', formData)
      .then((response) => {
        console.log(response.data)
      })
  }

  return (
    <div>Entry page
      <form onSubmit={handleSubmit}>
        <label htmlFor='username'>Enter user name:</label>
        <input type='text' id='username' name='username' value={formData.username} onChange={handleChange} />

        <label htmlFor='gamecode'>Game code:</label>
        <input type='text' id='gamecode' name='gamecode' value={formData.gamecode} onChange={handleChange} />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}