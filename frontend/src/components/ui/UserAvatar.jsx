import React, { useState } from 'react';
import apiClient from '@/api/axios';

const UserAvatar = ({ user, className, alt }) => {
  const [imgError, setImgError] = useState(false);

  const getInitialsAvatar = () => {
    const name = user?.username || user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  const getProfilePictureUrl = () => {
    if (!user?.profilePicture || user.profilePicture === '/images/default-profile.png') {
      return getInitialsAvatar();
    }
    
    // If it's already an absolute URL (like ui-avatars), return it
    if (user.profilePicture.startsWith('http')) {
      return user.profilePicture;
    }

    // Otherwise, prepend the API base URL
    return `${apiClient.defaults.baseURL.replace('/api', '')}/${user.profilePicture.replace(/\\/g, '/')}`;
  };

  const imgSrc = imgError ? getInitialsAvatar() : getProfilePictureUrl();

  return (
    <img
      src={imgSrc}
      alt={alt || user?.username || 'User'}
      className={className || "w-10 h-10 rounded-full object-cover"}
      onError={() => setImgError(true)}
    />
  );
};

export default UserAvatar;
