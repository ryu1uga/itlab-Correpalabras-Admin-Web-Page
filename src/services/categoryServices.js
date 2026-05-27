import { getHeaders, handleResponse } from '../utils/headerUtils';

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/admin`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    if (!data) {
      throw new Error('Categoría no encontrada');
    }
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });

    const data = await handleResponse(response);
    if (!data) {
      throw new Error('Error al crear la categoría: respuesta vacía del servidor');
    }
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });

    const data = await handleResponse(response);
    if (!data) {
      throw new Error('Error al crear la categoría: respuesta vacía del servidor');
    }
    return data;
    
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/${categoryId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error deleting category');
    }
    return true;
    
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw error;
  }
};

export const fetchMostVisitedCategories = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/mostVisited`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};