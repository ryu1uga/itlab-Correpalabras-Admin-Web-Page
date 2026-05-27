import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { loginUser } from "../../services/loginServices";
import img from './ic_full_logo.png';
import './Login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await loginUser(email, password);
      navigate('/cuentos');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-p">
      <div className="login-container">
        <img src={img} alt="Correpalabras" className="login-logo" />
        <h3>admin page</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Usuario</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="button-container">
            <button type="submit">Iniciar sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

