import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  // Get the userId from the URL, e.g., if your route is "/profile/:userId"
  const { userId } = useParams();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Define the function to fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const apiUrl = `${import.meta.env.VITE_API_URL}/users/${userId}`;
        const response = await axios.get(apiUrl);
        setUser(response.data);
        setError('');
      } catch (err) {
        setError(`Failed to fetch user data. ${err.response?.data?.message || err.message}`);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]); // Re-run the effect if the userId changes

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  // Render the user's public profile data
  return (
    <div>
      <h1>{user.name}'s Profile</h1>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Bio:</strong> {user.bio || 'No bio provided.'}
      </p>
      {/* Add other user details you want to display */}
    </div>
  );
};

export default UserProfile;