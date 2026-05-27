export const getHeaders = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('userToken');
  return {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'UserId': userId,
    'Token': token
  };
};

// Función auxiliar para obtener headers sin Content-Type para FormData
export const getFormDataHeaders = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('userToken');
  return {
    'Accept': '*/*',
    'UserId': userId,
    'Token': token
  };
};

export const handleResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }else {
      return { message: "Success!" };
    }
  };