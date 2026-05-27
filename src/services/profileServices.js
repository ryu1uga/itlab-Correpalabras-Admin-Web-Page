import { getHeaders } from '../utils/headerUtils';

export const fetchProfilesCount = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Profiles/count`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching profiles count:', error);
    throw error;
  }
};