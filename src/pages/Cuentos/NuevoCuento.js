import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createStoryWithThumbnail, validateImageFile } from "../../services/storyServices";
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";
import './NuevoCuento.css';

function NuevoCuento() {
  const [author, setAuthor] = useState('');
  const [illustrator, setIllustrator] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewSource, setPreviewSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const navigate = useNavigate();

  const validateFileType = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMensaje('Por favor seleccione un archivo de imagen válido (JPG, PNG, GIF, WEBP)');
      setIsPopupOpen2(true);
      return false;
    }
    return true;
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file)) {
      e.target.value = '';
      return;
    }

    setThumbnailFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  const handleCancel = () => {
    navigate('/cuentos');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      if (!thumbnailFile) {
        throw new Error('Por favor seleccione una imagen para la miniatura');
      }
  
      // Validar el archivo antes de enviarlo
      validateImageFile(thumbnailFile);
  
      const storyData = {
        author,
        illustrator,
        title,
        countPages: 0
      };
  
      const result = await createStoryWithThumbnail(storyData, thumbnailFile);
      console.log('Cuento creado exitosamente:', result);
  
      setMensaje('Cuento creado exitosamente');
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error:', error);
      setMensaje(error.message || 'Error al crear el cuento. Por favor, intente nuevamente.');
      setIsPopupOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nuevo-cuento-page">
      <h1>Crear nuevo cuento</h1>
      <form onSubmit={handleSubmit} className="nuevo-cuento-form">
        <div className="form-group">
          <label htmlFor="autor">Autor</label>
          <input
            id="autor"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ilustrador">Ilustrador</label>
          <input
            id="ilustrador"
            type="text"
            value={illustrator}
            onChange={(e) => setIllustrator(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="miniatura">Miniatura (735x437)</label>
          <input
            id="miniatura"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            required
          />
        </div>

        {previewSource && (
          <div className="preview-container">
            <img
              src={previewSource}
              alt="Vista previa de la miniatura"
              className="thumbnail-preview"
            />
          </div>
        )}

        <div className="form-group-buttons">
          <button type="submit" disabled={isLoading} className="submit-button2">
            {isLoading ? 'Creando...' : 'Crear Cuento'}
          </button>

          <button type='button' className="submit-button2" onClick={handleCancel}>Cancelar</button>
        </div>
        

      </form>
      <ModalConfirmation
            isOpen={isPopupOpen2} 
            onClose={() => setIsPopupOpen2(false)} 
            message={mensaje}
          /> 
      <ModalConfirmation
            isOpen={isPopupOpen} 
            onClose={() => navigate('/cuentos')} 
            message={mensaje}
          /> 
    </div>
  );
}

export default NuevoCuento;

