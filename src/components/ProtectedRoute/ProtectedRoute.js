import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userLogin = localStorage.getItem('userId');
  
  if (!userLogin) {
    return <Navigate to="/acceso-denegado" replace />;
  }
  
  return children; // Retorna los children si está autenticado
};

export default ProtectedRoute;