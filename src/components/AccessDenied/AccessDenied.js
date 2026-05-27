import { Link } from 'react-router-dom';
import './AccessDenied.css';

const AccessDenied = () => {
  return (
    <div className="no-autorizado">
      <h1>Acceso Denegado</h1>
      <p>No tienes autorización para acceder a esta página.</p>
      <Link to="/" style={{ textDecoration: 'underline', color: 'blue' }}>
        Volver al inicio de sesión
      </Link>
    </div>
  );
};

export default AccessDenied;