import { getHeaders, getFormDataHeaders, handleResponse } from '../utils/headerUtils';

export const fetchAvatars = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Avatars`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(response, 'Error fetching avatars');
    } catch (error) {
      console.error('Error in fetchAvatars:', error);
      throw error;
    }
  };
  
  export const createAvatar = async (avatarImage, storyId) => {
    try {
      const formData = new FormData();
      formData.append('avatarImage', avatarImage);
      formData.append('storyId', storyId);
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Avatars`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData
      });
      return handleResponse(response, 'Error creating avatar');
    } catch (error) {
      console.error('Error in createAvatar:', error);
      throw error;
    }
  };
  
  export const deleteAvatar = async (avatarId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Avatars/${avatarId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(response, 'Error deleting avatar');
    } catch (error) {
      console.error('Error in deleteAvatar:', error);
      throw error;
    }
  };