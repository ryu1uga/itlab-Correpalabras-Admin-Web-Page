import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../services/categoryServices';
import './NuevaCategoria.css';
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";


function NuevaCategoria() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/categorias');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const categoryData = {
        name,
        code
      };

      await createCategory(categoryData);
      setMensaje('Categoría creada exitosamente');
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      setMensaje('Error al crear la categoría. Por favor, intente nuevamente.');
      setIsPopupOpen(true);
    }
  };

  return (
    <div className="nuevo-cuento-page">
      <h1>Crear nueva categoría</h1>
      <form onSubmit={handleSubmit} className="nuevo-cuento-form">
      <div className="form-group">
        <label>
          Nombre:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        </div>

        <div className="form-group">
        <label>
          Código:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        </div>

        
        <div className="form-group-buttons">
          <button type="submit" className="submit-button2">Crear Categoría</button>

          <button type='button' className="submit-button2" onClick={handleCancel}>Cancelar</button>
        </div>
      </form>
      <ModalConfirmation
            isOpen={isPopupOpen} 
            onClose={() => navigate('/categorias')} 
            message={mensaje}
          /> 
    </div>
  );
}

export default NuevaCategoria;