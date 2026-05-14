import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreatePost({ onPostCreated }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('description', description);
    formData.append('isOpenToWork', isOpenToWork);

    try {
      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      setFile(null);
      setDescription('');
      setIsOpenToWork(false);
      setError('');
      if (onPostCreated) onPostCreated(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="create-post-container">
      <h3>Create a Post</h3>
      <form onSubmit={handleSubmit} className="create-post-form">
        <input 
          type="file" 
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])} 
          required 
        />
        <textarea 
          placeholder="What's on your mind?" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <label>
          <input 
            type="checkbox" 
            checked={isOpenToWork}
            onChange={(e) => setIsOpenToWork(e.target.checked)}
          />
          Open to Work / Hiring?
        </label>
        <button type="submit">Post Media</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
