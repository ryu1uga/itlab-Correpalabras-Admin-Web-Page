import { useState, useEffect } from "react";
import { fetchAvatars, createAvatar, deleteAvatar } from '../../services/avatarServices';
import { fetchStories } from "../../services/storyServices";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";
import './Avatars.css';

function Avatars() {
  const [avatars, setAvatars] = useState([]);
  const [stories, setStories] = useState([]);

  const [selectedStory, setSelectedStory] = useState('');
  const [avatarToDelete, setAvatarToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [previewSource, setPreviewSource] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);

  useEffect(() => {
    loadAvatars();
    loadStories();
  }, []);

  const loadAvatars = async () => {
    try {
      const data = await fetchAvatars();
      setAvatars(data.data);
    } catch (error) {
      console.error('Error loading avatars:', error);
      setMensaje('Error al cargar los avatars');
      setIsPopupOpen2(true);
    }
  };

  const loadStories = async () => {
      try {
        const data = await fetchStories();
        setStories(data);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    };

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

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  const handleDelete = async (avatarId) => {
    try {
      await deleteAvatar(avatarId);
      setAvatars(avatars.filter(avatar => avatar.id !== avatarId));
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setMensaje('Error al eliminar el avatar');
      setIsPopupOpen2(true);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMensaje('Por favor seleccione una imagen');
      setIsPopupOpen2(true);
      return;
    }

    if (!selectedStory) {
      setMensaje('Por favor seleccione un cuento');
      setIsPopupOpen2(true);
      return;
    }

    setIsUploading(true);
    try {
      const newAvatar = await createAvatar(selectedFile, selectedStory);
      setAvatars([...avatars, newAvatar]);
      setSelectedFile(null);
      // Reset file input
      e.target.reset();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMensaje('Error al subir el avatar');
      setIsPopupOpen2(true);
    } finally {
      setIsUploading(false);
      setPreviewSource('')
    }
  };

  const handleConfirmDelete = async () => {
    if (avatarToDelete) {
      await handleDelete(avatarToDelete);
      setIsPopupOpen(false);
      setAvatarToDelete(null);
      setSelectedStory('');
    }
  };

  return (
    <div className='avatars-page'>
      <div className="upload-section">
  <h1 className="upload-title">Avatars</h1>
  <form onSubmit={handleUpload} className="upload-form">
    <div className="form-group">
      <label htmlFor="file-input" className="form-label">Seleccionar imagen (500x500)</label>
      <div className="file-input-container">
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="file-input"
        />
        <span className="file-input-label">
          {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
        </span>
      </div>
    </div>
    
    <div className="form-group">
      <label htmlFor="story-select" className="form-label">Cuento asociado</label>
      <select
        id="story-select"
        value={selectedStory}
        onChange={e => setSelectedStory(e.target.value)}
        className="story-select"
      >
        <option value="">Todos los cuentos</option>
        {stories.map(story => (
          <option key={story.id} value={story.id}>
            {story.title}
          </option>
        ))}
      </select>
    </div>

    <div className="preview-and-submit">
      {previewSource && (
        <div className="preview-container">
          <p className="preview-label">Vista previa</p>
          <img
            src={previewSource}
            alt="Vista previa del avatar"
            className="preview-image"
          />
        </div>
      )}
    </div>
    <div className="form-group-buttons">
    <button 
        type="submit" 
        disabled={isUploading || !selectedFile}
        className="submit-button"
      >
        {isUploading ? 
          <span><span className="loader"></span> Subiendo...</span> : 
          'Subir avatar'}
      </button>
      </div>
  </form>
</div>

<div className="avatars-container">
  <h3 className="avatars-title">Avatares disponibles</h3>
  
  {avatars.length === 0 ? (
    <div className="no-avatars">
      <p>No hay avatares disponibles. ¡Sube uno para comenzar!</p>
    </div>
  ) : (
    <div className="avatars-grid">
      {avatars.map(avatar => (
        <div key={avatar.id} className="avatar-card">
          <div className="avatar-image-container">
            <img src={avatar.avatarUrl} alt="Avatar" className="avatar-image" />
          </div>
          <div className="avatar-card-footer">
            {avatar.storyTitle && (
              <span className="avatar-story-tag">{avatar.storyTitle}</span>
            )}
            <button
              onClick={() => {
                setAvatarToDelete(avatar.id);
                setIsPopupOpen(true);
              }}
              className="delete-button"
              aria-label="Eliminar avatar"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      <ConfirmationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onConfirm={handleConfirmDelete}
        entityType="avatar"
      />
      <ModalConfirmation
        isOpen={isPopupOpen2} 
        onClose={() => setIsPopupOpen2(false)} 
        message={mensaje}
      /> 
    </div>
  );
}

export default Avatars;