export const loginUser = async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Users/loginAdmin`, {
      method: 'POST',
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
  
    const data = await response.json();
  
    // Guardar en localStorage
    localStorage.setItem('userId', data.data.id);
    localStorage.setItem('userName', data.data.name);
    localStorage.setItem('userEmail', data.data.email);
    localStorage.setItem('userToken', data.data.token);
  
    return data;
  };