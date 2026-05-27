import { Routes, Route, useLocation} from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Cuentos from './pages/Cuentos/Cuentos';
import EditarCuentos from './pages/Cuentos/EditarCuentos';
import NuevoCuento from './pages/Cuentos/NuevoCuento';
import Categorias from './pages/Categorias/Categorias';
import NuevaCategoria from './pages/Categorias/NuevaCategoria';
import Idiomas from './pages/Idiomas/Idiomas';
import EditarIdioma from './pages/Idiomas/EditarIdioma';
import Avatars from './pages/Avatars/Avatars';
import StoryImporter from './pages/Cuentos/StoryImporter';
import ImageTester from './pages/Cuentos/ImageTester';
import Reportes from './pages/Reportes/Reportes';
import Usuarios from './pages/Usuarios/Usuarios';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AccessDenied from './components/AccessDenied/AccessDenied';

import './App.css';
import NuevoIdioma from './pages/Idiomas/NuevoIdioma';
import EditarCategoria from './pages/Categorias/EditarCategoria';

function App() {

  const location = useLocation();

  const hideNavbarRoutes = ['/', '/not-found', '/acceso-denegado'];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  

  return (
    <>
      {!shouldHideNavbar && (
          <Navbar />
        )}
      <Routes>
        <Route path='/home' element={<ProtectedRoute><Home/></ProtectedRoute>} />
        <Route path='/cuentos' element={<ProtectedRoute><Cuentos/></ProtectedRoute>} />
        <Route path='/editar-cuento/:id' element={<ProtectedRoute><EditarCuentos/></ProtectedRoute>} />
        <Route path='/crear-cuento' element={<ProtectedRoute><NuevoCuento/></ProtectedRoute>} />
        <Route path='/categorias' element={<ProtectedRoute><Categorias/></ProtectedRoute>} />
        <Route path='/crear-categoria' element={<ProtectedRoute><NuevaCategoria/></ProtectedRoute>} />
        <Route path='/editar-categoria/:id' element={<ProtectedRoute><EditarCategoria/></ProtectedRoute>} />
        <Route path='/idiomas' element={<ProtectedRoute><Idiomas/></ProtectedRoute>} />
        <Route path='/crear-idioma' element={<ProtectedRoute><NuevoIdioma/></ProtectedRoute>} />
        <Route path='/editar-idioma/:id' element={<ProtectedRoute><EditarIdioma/></ProtectedRoute>} />
        <Route path="/import-story" element={<ProtectedRoute><StoryImporter /></ProtectedRoute>} />
        <Route path="/image-tester" element={<ProtectedRoute><ImageTester /></ProtectedRoute>} />
        <Route path='/avatars' element={<ProtectedRoute><Avatars/></ProtectedRoute>} />
        <Route path='/reportes' element={<ProtectedRoute><Reportes/></ProtectedRoute>} />
        <Route path='/usuarios' element={<ProtectedRoute><Usuarios/></ProtectedRoute>} />
        
        {/* Rutas públicas (sin protección) */}
        <Route path='/' element={<Login/>} />
        <Route path='/acceso-denegado' element={<AccessDenied/>} />
      </Routes>
    </>
  );
}

export default App;



