import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './NuevoIdioma.css';
import { createLanguage } from "../../services/languageServices";
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";

function NuevoIdioma() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCancel = () => {
    navigate('/idiomas');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const languageData = { name };
      await createLanguage(languageData);
      setMensaje('Idioma creado exitosamente');
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error al crear el idioma:', error);
      setMensaje('Error al crear el idioma. Por favor, intente nuevamente.');
      setIsPopupOpen(true);
    } 
  };

  return (
    <div className="nuevo-cuento-page">
      <h1>Crear nuevo idioma</h1>
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

      <div className="form-group-buttons">
        <button type="submit" className="submit-button2">Crear Idioma</button>

          <button type='button' className="submit-button2" onClick={handleCancel}>Cancelar</button>
        </div>
      
        
      </form>
      <ModalConfirmation
            isOpen={isPopupOpen} 
            onClose={() => navigate('/idiomas')} 
            message={mensaje}
          /> 
    </div>
  );
}

export default NuevoIdioma;