import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import PageItem from "../../components/PageItem/PageItem.js";
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation.js";
import './EditarCuentos.css';
import {
    fetchStoryById,
    fetchCategories,
    updateStory,
    assignCategoriesToStory,
    fetchLanguages,
    assignLanguagesToStory,
    fetchAttachmentsByStory,
    validateImageFile,
    processAttachment,
    fetchPages,
    createPage,
    updatePage,
    createPageContent,
    updatePageContent,
    deletePage
  } from '../../services/storyServices.js';

function EditarCuentos() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [story, setStory] = useState(null);
    const [author, setAuthor] = useState('');
    const [illustrator, setIllustrator] = useState('');
    const [title, setTitle] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewSource, setPreviewSource] = useState('');

    const [pages, setPages] = useState([]);
    const [pageContents, setPageContents] = useState({});
    const [pagesToDelete, setPagesToDelete] = useState([]);
    const [pageFiles, setPageFiles] = useState({});

    const [categories, setCategories] = useState([]); 
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [originalCategories, setOriginalCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [originalLanguages, setOriginalLanguages] = useState([]);

    const [attachments, setAttachments] = useState({});
    const [attachmentFiles, setAttachmentFiles] = useState({});

    const [expandedPages, setExpandedPages] = useState({});

    const [activeLanguage, setActiveLanguage] = useState(null);

    const [mensaje, setMensaje] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupOpen2, setIsPopupOpen2] = useState(false);
    
    // Cargar data inicial
    useEffect(() => {
      const loadStoryData = async () => {
          try {
              const storyDataRaw = await fetchStoryById(id);
              const storyData = storyDataRaw.data;
              
              if (storyData) {
                  setStory(storyData);
                  setAuthor(storyData.author || '');
                  setIllustrator(storyData.illustrator || '');
                  setTitle(storyData.title || '');
                  setPreviewSource(storyData.thumbnail || '');

                  const [categoriesData, languagesData] = await Promise.all([
                    fetchCategories(),
                    fetchLanguages(),
                    fetchPages(id),
                    fetchAttachmentsByStory(id)
                  ]);

                  setCategories(categoriesData.data || []);
                  setLanguages(languagesData.data || []);
                  
                  // Ordenar páginas
                  const orderedPages = [...storyData.pages].sort((a, b) => a.pageOrder - b.pageOrder);
                  setPages(orderedPages);
                  
                  // Procesar categorías
                  const storyCategoryIds = storyData.storyCategories?.map(sc => sc.categoryId) || [];
                  setSelectedCategories(storyCategoryIds);
                  setOriginalCategories(storyCategoryIds);
                  
                  // Procesar idiomas
                  const storyLanguageIds = storyData.storyLanguages?.map(sl => sl.languageId) || [];
                  setSelectedLanguages(storyLanguageIds);
                  setOriginalLanguages(storyLanguageIds);
                  
                  // Procesar attachments
                  const organizedAttachments = (storyData.attachments || []).reduce((acc, attachment) => {
                      if (attachment.typeImage === 'Cover') {
                          acc[attachment.languageId] = {
                              ...attachment,
                              imageUrl: attachment.imageUrl || ''
                          };
                      }
                      return acc;
                  }, {});
                  setAttachments(organizedAttachments);
                  
                  // Procesar contenidos de páginas
                  const organizedContents = {};
                  storyData.pages.forEach(page => {
                      if (page.pageContents) {
                          organizedContents[page.id] = {};
                          page.pageContents.forEach(content => {
                              organizedContents[page.id][content.languageId] = {
                                  ...content,
                                  content: content.content || '',
                                  countWords: content.countWords || 0
                              };
                          });
                      }
                  });
                  setPageContents(organizedContents);
              }
          } catch (error) {
            console.error('Error loading story data:', error);
            setMensaje('Error al cargar los datos del cuento');
            setIsPopupOpen2(true);
          }
      };
      
      loadStoryData();
    }, [id]);

    // Establece el idioma activo por defecto cuando se cargan los idiomas seleccionados
    useEffect(() => {
        if (selectedLanguages.length > 0 && !activeLanguage) {
        setActiveLanguage(selectedLanguages[0]);
        } else if (selectedLanguages.length === 0) {
        setActiveLanguage(null);
        } else if (!selectedLanguages.includes(activeLanguage)) {
        setActiveLanguage(selectedLanguages[0]);
        }
    }, [selectedLanguages, activeLanguage]);
  
    // Función para cambiar entre idiomas
    const handleLanguageTabChange = (languageId) => {
        setActiveLanguage(languageId);
    };

    const togglePageExpansion = (pageId) => {
        setExpandedPages(prev => ({
        ...prev,
        [pageId]: !prev[pageId]
        }));
    };

  const handleCategoryChange = (e) => {
      const categoryId = e.target.value;
      setSelectedCategories(prev => 
          prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId)
              : [...prev, categoryId]
      );
  };

  const handleLanguageChange = (e) => {
      const languageId = e.target.value;
      setSelectedLanguages(prev => 
          prev.includes(languageId) 
              ? prev.filter(id => id !== languageId)
              : [...prev, languageId]
      );
  };

  const handleAttachmentChange = (languageId, file) => {
      try {
          if (file) {
              validateImageFile(file);
              
              setAttachmentFiles(prev => ({
                  ...prev,
                  [languageId]: file
              }));
              
              // Crear un preview
              const reader = new FileReader();
              reader.onloadend = () => {
                  setAttachments(prev => ({
                      ...prev,
                      [languageId]: {
                          ...(prev[languageId] || {}),
                          storyId: id,
                          languageId,
                          typeImage: "Cover",
                          position: "00",
                          orderAttachments: 1,
                          imageUrl: reader.result
                      }
                  }));
              };
              reader.readAsDataURL(file);
          }
      } catch (error) {
          console.log(error.message);
      }
  };

  const createInitialPage = (storyId, pageOrder) => ({
      id: `temp-${Date.now()}-${pageOrder}`,
      storyId: storyId,
      pageOrder: pageOrder,
      imageUrl: '',
      isNew: true,
      pageContents: []
  });

  const handleAddPage = () => {
      const newPage = createInitialPage(id, pages.length + 1);
      setPages([...pages, newPage]);
  };

  const handleRemovePage = (pageIndex) => {
      const pageToRemove = pages[pageIndex];
      
      // Solo considerar páginas existentes
      if (pageToRemove.id && !pageToRemove.id.startsWith('temp-')) {
          setPagesToDelete(prev => [...prev, pageToRemove.id]);
      }
  
      // Actualizar estado de páginas
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      const reorderedPages = updatedPages.map((page, index) => ({
          ...page,
          pageOrder: index + 1
      }));
  
      setPages(reorderedPages);
  
      // Limpiar contenidos de páginas eliminadas
      if (pageToRemove.id) {
          setPageContents(prev => {
              const updatedContents = { ...prev };
              delete updatedContents[pageToRemove.id];
              return updatedContents;
          });
      }
  
      // Limpiar archivos adjuntos a páginas
      if (pageFiles[pageToRemove.id]) {
          setPageFiles(prev => {
              const updatedFiles = { ...prev };
              delete updatedFiles[pageToRemove.id];
              return updatedFiles;
          });
      }
  };

  const handleMovePageUp = (pageIndex) => {
      if (pageIndex > 0) {
          const updatedPages = [...pages];
          [updatedPages[pageIndex - 1], updatedPages[pageIndex]] = 
          [updatedPages[pageIndex], updatedPages[pageIndex - 1]];
          
          updatedPages[pageIndex - 1].pageOrder = pageIndex;
          updatedPages[pageIndex].pageOrder = pageIndex + 1;
          
          setPages(updatedPages);
      }
  };
  
  const handleMovePageDown = (pageIndex) => {
      if (pageIndex < pages.length - 1) {
          const updatedPages = [...pages];
          [updatedPages[pageIndex], updatedPages[pageIndex + 1]] = 
          [updatedPages[pageIndex + 1], updatedPages[pageIndex]];
          
          updatedPages[pageIndex].pageOrder = pageIndex + 1;
          updatedPages[pageIndex + 1].pageOrder = pageIndex + 2;
          
          setPages(updatedPages);
      }
  };

  const handlePageContentChange = (pageId, languageId, value) => {
      setPageContents(prev => ({
          ...prev,
          [pageId]: {
              ...(prev[pageId] || {}),
              [languageId]: {
                  ...(prev[pageId]?.[languageId] || {}),
                  content: value,
                  countWords: value.split(/\s+/).filter(Boolean).length,
                  isTemp: pageId.startsWith('temp-')
              }
          }
      }));
  };

  
const handlePageImageChange = (pageIndex, file) => {
  if (!file) return;
  const pageId = pages[pageIndex]?.id;
  setPageFiles(prev => ({ ...prev, [pageId]: file }));

  const reader = new FileReader();
  reader.onloadend = () => {
    setPages(prev => {
      const copy = [...prev];
      copy[pageIndex] = { ...copy[pageIndex], imageUrl: reader.result };
      return copy;
    });
  };
  reader.readAsDataURL(file);
};


  const handleThumbnailChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!validTypes.includes(file.type)) {
            setMensaje('Por favor seleccione un archivo de imagen válido (JPG, PNG, GIF, WEBP)');
            setIsPopupOpen2(true);
            return;
          }
      
          setThumbnailFile(file);
      
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewSource(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCancel = () => {
    navigate('/cuentos');
  }

  const handleSubmit = async (event) => {
      event.preventDefault();
      try {
          // Validar páginas con imágenes
          const pagesWithoutImages = pages.filter(page => {
              if (page.id.startsWith('temp-')) {
                  return !pageFiles[page.id];
              }
              return false;
          });

          if (pagesWithoutImages.length > 0) {

            const pageNumbers = pagesWithoutImages.map(page => page.pageOrder).join(', ');
            setMensaje(`No se pueden guardar los cambios. Por favor, agregue imágenes para las siguientes páginas: ${pageNumbers}`);
            setIsPopupOpen2(true);
            return;
          }
      
          // Actualizar data del cuento
          const storyData = {
              id,
              author,
              illustrator,
              title,
              countPages: pages.length,
              updatedAt: new Date().toISOString(),
          };
          
          await updateStory(storyData, thumbnailFile);
      
          // Actualizar categorías e idiomas
          await Promise.all([
              assignCategoriesToStory(id, selectedCategories, originalCategories, story.storyCategories),
              assignLanguagesToStory(id, selectedLanguages, originalLanguages, story.storyLanguages)
          ]);
      
          // Procesar attachments(carátulas)
          for (const languageId of selectedLanguages) {
            const attachment = attachments[languageId];
            const file = attachmentFiles[languageId];
            
            // Solo procesar si hay un archivo nuevo o si hay un adjunto que no es temporal
            if (file) {
                // Si hay un archivo nuevo, procesarlo
                await processAttachment(languageId, attachment || { storyId: id }, file);
            } else if (attachment && !attachment.id) {
                // Si es un nuevo adjunto sin archivo, procesarlo
                await processAttachment(languageId, { ...attachment, storyId: id }, null);
            }
            // No hacer nada si no hay cambios (ni archivo nuevo ni adjunto nuevo)
        }
      
          // Verifica si hay páginas por eliminar
          if (pagesToDelete.length > 0) {
              await Promise.all(pagesToDelete.map(pageId => deletePage(pageId)));
          }
      
          // Procesar páginas
          for (let i = 0; i < pages.length; i++) {
              const page = pages[i];
              const isNewPage = page.id.startsWith('temp-');
              const file = pageFiles[page.id];

              const pageData = {
                  storyId: id,
                  pageOrder: page.pageOrder
              };

              let savedPage;
              
              if (!isNewPage) {
                  savedPage = await updatePage(page.id, pageData, file);
              } else {
                  if (!file) {
                      throw new Error(`Se requiere una imagen para la nueva página ${page.pageOrder}`);
                  }
                  savedPage = await createPage(pageData, file);
              }
          
              // Procesar contenido de las páginas
              const currentPageId = savedPage.id || page.id;
              if (currentPageId) {
                  for (const languageId of selectedLanguages) {
                      const existingContent = pageContents[page.id]?.[languageId];
                      const contentText = existingContent?.content || '';
              
                      try {
                          if (!isNewPage && existingContent?.id) {
                              await updatePageContent(existingContent.id, {
                                  pageId: currentPageId,
                                  languageId,
                                  content: contentText.replace(/[\r\n]+/g, ' '),
                                  countWords: contentText.split(/\s+/).filter(Boolean).length
                              });
                          } else {
                              await createPageContent({
                                  pageId: savedPage.data.id ? savedPage.data.id : currentPageId,
                                  languageId,
                                  content: contentText.replace(/[\r\n]+/g, ' '),
                                  countWords: contentText.split(/\s+/).filter(Boolean).length
                              });
                          }
                      } catch (contentError) {
                          console.error(`Error procesando contenido de página ${currentPageId}, idioma ${languageId}:`, contentError);
                          throw contentError;
                      }
                  }
              }
          }
          setMensaje('Cuento actualizado exitosamente.');
          setIsPopupOpen(true);
      } catch (error) {
        console.error("Error al actualizar el cuento:", error);
        setMensaje('Error al actualizar el cuento. Por favor, intente nuevamente.');
        setIsPopupOpen2(true);
      }
  };

    return (
        <div className="nuevo-cuento-page">
            <h1>Editar cuento: {title}</h1>
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
                        onChange={handleThumbnailChange}
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

                {/* Secciones de Filtros */}
                <div className="filters-section">
                {/* Selección de categorías */}
                <div className="filter-group">
                    <h3 className="filter-title">Categorías</h3>
                    <div className="filter-options">
                    {categories.map(category => (
                        <div className="filter-item" key={category.id}>
                        <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            value={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onChange={handleCategoryChange}
                            className="filter-checkbox"
                        />
                        <label htmlFor={`category-${category.id}`} className="filter-label">
                            {category.name}
                        </label>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Selección de idiomas */}
                <div className="filter-group">
                    <h3 className="filter-title">Idiomas disponibles</h3>
                    <div className="filter-options">
                    {languages.map(language => (
                        <div className="filter-item" key={language.id}>
                        <input
                            type="checkbox"
                            id={`language-${language.id}`}
                            value={language.id}
                            checked={selectedLanguages.includes(language.id)}
                            onChange={handleLanguageChange}
                            className="filter-checkbox"
                        />
                        <label htmlFor={`language-${language.id}`} className="filter-label">
                            {language.name}
                        </label>
                        </div>
                    ))}
                    </div>
                </div>
                </div>

            {/* Barra de navegación de idiomas */}
            {selectedLanguages.length > 0 && (
            <div className="language-tabs-container">
                <div className="language-tabs">
                {selectedLanguages.map(languageId => (
                    <button
                    key={languageId}
                    type="button"
                    className={`language-tab ${activeLanguage === languageId ? 'active' : ''}`}
                    onClick={() => handleLanguageTabChange(languageId)}
                    >
                    {languages.find(lang => lang.id === languageId)?.name || 'Idioma'}
                    </button>
                ))}
                </div>
            </div>
            )}

                {/* Contenido que cambia según el idioma seleccionado */}
                {selectedLanguages.length > 0 && activeLanguage && (
                <>
                    {/* Sección de portada para el idioma activo */}
                    <div className="covers-section">
                    <h2>Portada en {languages.find(lang => lang.id === activeLanguage)?.name || ''}</h2>
                    <div className="single-cover-container">
                        <div className="cover-item">
                        <div className="cover-content">
                            <div className="form-group">
                            <label htmlFor={`cover-${activeLanguage}`}>
                                Portada (960x540):
                            </label>
                            <input
                                type="file"
                                id={`cover-${activeLanguage}`}
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={(e) => handleAttachmentChange(activeLanguage, e.target.files[0])}
                                className="cover-input"
                            />
                            </div>
                            {attachments[activeLanguage]?.imageUrl && (
                            <div className="cover-preview">
                                <img
                                src={attachments[activeLanguage].imageUrl}
                                alt={`Portada en ${languages.find(lang => lang.id === activeLanguage)?.name || ''}`}
                                className="cover-image"
                                />
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Sección de páginas para el idioma activo */}
                    <div className="pages-section">
                    <div className="pages-header">
                        <h2 className="pages-title">
                        Páginas en {languages.find(lang => lang.id === activeLanguage)?.name || ''} ({pages.length})
                        </h2>
                        <button 
                        type="button" 
                        onClick={handleAddPage}
                        className="add-page-button"
                        >
                        <strong>Añadir página</strong>
                        </button>
                    </div>
                    <div className="pages-items-grid">
                        {pages.map((page, pageIndex) => (
                        <div className="page-item-wrapper" key={page.id || pageIndex}>
                            <div 
                            className="page-header" 
                            onClick={() => togglePageExpansion(page.id || pageIndex)}
                            >
                            <h3 className="page-title">
                                Página {pageIndex + 1}{page.title ? `: ${page.title}` : ''}
                            </h3>
                            <span className={`collapse-icon ${expandedPages[page.id || pageIndex] ? 'expanded' : ''}`}>
                                {expandedPages[page.id || pageIndex] ? '▼' : '►'}
                            </span>
                            </div>
                            {expandedPages[page.id || pageIndex] && (
                            <div className="page-content">
                                <PageItem
                                page={page}
                                pageIndex={pageIndex}
                                languages={languages}
                                selectedLanguages={[activeLanguage]}
                                pageContents={pageContents}
                                onRemovePage={handleRemovePage}
                                onPageImageChange={handlePageImageChange}
                                onPageContentChange={handlePageContentChange}
                                onMoveUp={handleMovePageUp}
                                onMoveDown={handleMovePageDown}
                                isFirst={pageIndex === 0}
                                isLast={pageIndex === pages.length - 1}
                                />
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    </div>
                </>
                )}

                {selectedLanguages.length === 0 && (
                <div className="no-languages-warning">
                    <p>Por favor, selecciona al menos un idioma para gestionar el contenido.</p>
                </div>
                )}

                <div className="form-group-buttons">
                    <button type="submit" className="submit-button2">Guardar cambios</button>

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

export default EditarCuentos;