import { getHeaders } from '../utils/headerUtils';

export const fetchMostReadStories = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories/mostRead`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching most read stories:', error);
    throw error;
  }
};