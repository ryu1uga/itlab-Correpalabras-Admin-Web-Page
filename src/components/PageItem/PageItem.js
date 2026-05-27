import { useState } from 'react';
import { validateImageFile } from '../../services/storyServices';
import './PageItem.css';

const PageItem = ({
  page,
  pageIndex,
  languages,
  selectedLanguages,
  pageContents,
  onRemovePage,
  onPageImageChange,
  onPageContentChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  // Estado local solo para preview
  const [previewUrl, setPreviewUrl] = useState(page.imageUrl || '');

  const languageId = selectedLanguages[0]; // Solo trabajamos con el idioma activo

  const pageContent = pageContents[page.id]?.[languageId] || { content: '' };
  
  // Obtener el nombre del idioma
  const languageName = languages.find(lang => lang.id === languageId)?.name || '';

  const handleContentChange = (e) => {
    onPageContentChange(page.id, languageId, e.target.value);
  };

  const handleImageChange = (e) => {
    try {

      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
      if (file) {
        validateImageFile(file);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
          // Notificar al padre sobre el cambio de archivo
          onPageImageChange(pageIndex, file);
        };
        reader.readAsDataURL(file);
      }
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="page-item-container">
      <div className="page-header">
        <h3 className="page-title">Página {page.pageOrder}</h3>
        <div className="page-controls">
          <button 
            type="button" 
            onClick={() => onMoveUp(pageIndex)}
            disabled={isFirst}
            className="move-button"
            title="Mover página arriba"
          >
            ↑
          </button>
          <button 
            type="button" 
            onClick={() => onMoveDown(pageIndex)}
            disabled={isLast}
            className="move-button"
            title="Mover página abajo"
          >
            ↓
          </button>
          <button 
            type="button" 
            onClick={() => onRemovePage(pageIndex)} 
            className="delete-button"
          >
            <strong>Eliminar página</strong>
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="image-section">
          <label htmlFor={`pageImage-${pageIndex}`} className="input-label">
            Imagen de la página {page.pageOrder}: (960x405)
          </label>
          
          <input
            type="file"
            id={`pageImage-${pageIndex}`}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="image-input"
            
          />

          {previewUrl && (
            <div className="image-preview-container">
              <img
                src={previewUrl}
                alt={`Vista previa de la página ${page.pageOrder}`}
                className="image-preview"
              />
            </div>
          )}
        </div>

        <div className="languages-grid">    
                <div key={`${page.id}-${languageId}`} className="language-item">
                    <h4>Texto en {languageName}</h4>
                    <textarea
                        value={pageContent.content || ''}
                        onChange={handleContentChange}
                        placeholder={`Escriba el texto de la página ${pageIndex + 1} en ${languageName}...`}
                        className="language-textarea"
                        rows="6"
                        required
                    />
                    <p className="word-count">
                        Palabras: {pageContent.content?.split(/\s+/).filter(Boolean).length || 0}
                    </p>
                </div>
        </div>
      </div>
    </div>
  );
};

export default PageItem;