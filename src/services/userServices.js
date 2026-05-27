import { getHeaders, handleResponse } from '../utils/headerUtils';

export const fetchUsers = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Users`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);
    if (!data) {
      throw new Error('Error al actualizar el usuario: respuesta vacía del servidor');
    }
    return data;
    
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};