import { Link } from "react-router-dom";
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import './Navbar.css';
import { IconContext } from "react-icons";

function Navbar() {
  const handleLogout = () => {
    // Limpiar localStorage al cerrar sesión
    localStorage.clear();
  };

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className="navbar">
          <Link to='/cuentos' className="menu-bars">
            <IoIcons.IoMdHome color="white" />
          </Link>
          <div className="navbar-center">
            <Link to='/usuarios' className="nav-item">
              Usuarios
            </Link>
            <Link to='/cuentos' className="nav-item">
              Cuentos
            </Link>
            <Link to='/categorias' className="nav-item">
              Categorías
            </Link>
            <Link to='/idiomas' className="nav-item">
              Idiomas
            </Link>
            <Link to='/avatars' className="nav-item">
              Avatars
            </Link>
            <Link to='/reportes' className="nav-item">
              Reportes
            </Link>
          </div>
          <div className="navbar-right">
            <MdIcons.MdPersonOff color="white" className="iconoclose" />
            <Link to='/' className="logout-link" onClick={handleLogout}>
              <p>Cerrar Sesión</p>
            </Link>
          </div>
        </div>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;

