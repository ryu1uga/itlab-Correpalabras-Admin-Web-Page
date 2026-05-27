import {getHeaders} from '../utils/headerUtils';

const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  
  return null;
};

export const fetchLanguages = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response, 'Error fetching languages');
    return data || [];
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

export const fetchLanguageById = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await handleResponse(response, 'Error al obtener el idioma');
    if (!data) {
      throw new Error('Idioma no encontrado');
    }
    return data;
  } catch (error) {
    console.error('Error fetching language:', error);
    throw error;
  }
};

export const createLanguage = async (languageData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(languageData)
    });

    const data = await handleResponse(response, 'Error creating language');
    if (!data) {
      throw new Error('Error: No se recibió respuesta al crear el idioma');
    }
    return data;
  } catch (error) {
    console.error('Error creating language:', error);
    throw error;
  }
};

export const updateLanguage = async (id, languageData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(languageData)
    });

    const data = await handleResponse(response, 'Error updating language');
    return data || { message: "Language updated successfully" };
  } catch (error) {
    console.error('Error updating language:', error);
    throw error;
  }
};

export const deleteLanguage = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error deleting language');
    }
    return true;
  } catch (error) {
    console.error('Error deleting language:', error);
    throw error;
  }
};

export const fetchMostDemandedLanguages = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages/mostDemanded`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response, 'Error fetching languages');
    return data.data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};



