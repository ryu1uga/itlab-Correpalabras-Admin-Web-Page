import { getHeaders, getFormDataHeaders } from '../utils/headerUtils';


export const fetchStories = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const createStoryWithThumbnail = async (storyData, thumbnailFile) => {
  try {
    // Validar el archivo
    if (!thumbnailFile || !(thumbnailFile instanceof File)) {
      throw new Error('Se requiere una imagen para la miniatura');
    }

    // Validar el tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(thumbnailFile.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, GIF y WEBP');
    }

    // Crear FormData con todos los datos
    const formData = new FormData();
    formData.append('Author', storyData.author);
    formData.append('Illustrator', storyData.illustrator);
    formData.append('Title', storyData.title);
    formData.append('CountPages', storyData.countPages || 0);
    formData.append('thumbnail', thumbnailFile);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories`, {
      method: 'POST',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al crear el cuento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating story with thumbnail:', error);
    throw error;
  }
};

// Función auxiliar para validar archivos
export const validateImageFile = (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Se requiere un archivo válido');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, GIF y WEBP');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB');
  }

  return true;
};

export const deleteStory = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return { message: "Story deleted successfully" };
    }
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Servicios para Stories
export const fetchStoryById = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener el cuento');
    return await response.json();
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

export const updateStory = async (storyData, thumbnailFile = null) => {
  try {
    const formData = new FormData();
    
    // Agregar los datos del cuento
    formData.append('Author', storyData.author);
    formData.append('Illustrator', storyData.illustrator);
    formData.append('Title', storyData.title);
    formData.append('CountPages', storyData.countPages || 0);
    
    // Si hay un nuevo archivo de imagen, agregarlo
    if (thumbnailFile instanceof File) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Stories/${storyData.id}`, {
      method: 'PUT',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al actualizar el cuento');
    }

    // Manejar la respuesta 204 No Content
    if (response.status === 204) {
      return { message: "Cuento actualizado exitosamente" };
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};



// Servicios para Categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Categories/admin`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Error fetching categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const assignCategoriesToStory = async (storyId, selectedCategories, originalCategories, storyCategories) => {
  // Nuevas categorías a agregar
  const newCategories = selectedCategories.filter(categoryId => !originalCategories.includes(categoryId));
  
  // Categorías a eliminar
  const categoriesToRemove = originalCategories.filter(id => !selectedCategories.includes(id));

  try {
    // Agregar nuevas categorías
    const addPromises = newCategories.map(categoryId => 
      fetch(`${process.env.REACT_APP_API_URL}/StoryCategories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ storyId, categoryId })
      })
    );
   
    // Eliminar categorías
    if(categoriesToRemove.length > 0) {
      const removePromises = categoriesToRemove.map(categoryId => {
        const storyCategory = storyCategories.find(sc => sc.categoryId === categoryId);
        if (storyCategory) {
          return fetch(`${process.env.REACT_APP_API_URL}/StoryCategories/${storyCategory.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
        } else {
          return null
        }
      }).filter(Boolean);
      await Promise.all([...addPromises, ...removePromises]);
    }

    await Promise.all([...addPromises]);
  } catch (error) {
    console.error('Error managing categories:', error);
    throw error;
  }
};

// Servicios para Languages
export const fetchLanguages = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Languages`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Error fetching languages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};

export const assignLanguagesToStory = async (storyId, selectedLanguages, originalLanguages, storyLanguages) => {
  const newLanguages = selectedLanguages.filter(languageId => !originalLanguages.includes(languageId));
  const languagesToRemove = originalLanguages.filter(id => !selectedLanguages.includes(id));

  try {
    // Agregar nuevos idiomas
    const addPromises = newLanguages.map(languageId => 
      fetch(`${process.env.REACT_APP_API_URL}/StoryLanguages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ storyId, languageId })
      })
    );

    // Eliminar idiomas
    if(languagesToRemove.length > 0) {
      const removePromises = languagesToRemove.map(languageId => {
        const storyLanguage = storyLanguages.find(sl => sl.languageId === languageId);
        if (storyLanguage) {
          return fetch(`${process.env.REACT_APP_API_URL}/StoryLanguages/${storyLanguage.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
        } else {
          return null
        }
      }).filter(Boolean);
      await Promise.all([...addPromises, ...removePromises]);
    } else
    

    await Promise.all([...addPromises]);
  } catch (error) {
    console.error('Error managing languages:', error);
    throw error;
  }
};

export const fetchAttachmentsByStory = async (storyId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Attachments`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error fetching attachments');
    const allAttachments = await response.json();
    
    // Filtrar los attachments que corresponden al cuento específico
    return allAttachments.data.filter(attachment => attachment.storyId === storyId);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createAttachment = async (attachmentData, file) => {
  try {
    let formData = new FormData();
    if (file) {
      // Caso 1: Se proporciona un archivo de imagen
      validateImageFile(file);
      formData.append('StoryId', attachmentData.storyId);
      formData.append('LanguageId', attachmentData.languageId);
      formData.append('TypeImage', attachmentData.typeImage);
      formData.append('Position', attachmentData.position);
      formData.append('OrderAttachments', attachmentData.orderAttachments);
      formData.append('file', file);
      
    } else {
      console.log("URL de attachment: "+attachmentData.imageUrl)
      // Caso 2: Se proporciona la URL de la imagen en pageData
      if (!attachmentData.imageUrl) {
        throw new Error('Se requiere imageUrl cuando no se proporciona un archivo de imagen');
      } else { 
        formData.append('StoryId', attachmentData.storyId);
        formData.append('LanguageId', attachmentData.languageId);
        formData.append('TypeImage', attachmentData.typeImage);
        formData.append('Position', attachmentData.position);
        formData.append('OrderAttachments', attachmentData.orderAttachments);
        formData.append('ImageUrl', attachmentData.imageUrl);
      }
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Attachments`, {
      method: 'POST',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al crear el attachment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating attachment:', error);
    throw error;
  }
};

export const updateAttachment = async (id, attachmentData, file = null) => {
  try {
    // Si hay archivo, validarlo
    if (file) {
      validateImageFile(file);
    }

    // Crear FormData con todos los datos
    const formData = new FormData();
    formData.append('StoryId', attachmentData.storyId);
    formData.append('LanguageId', attachmentData.languageId);
    formData.append('TypeImage', attachmentData.typeImage);
    formData.append('Position', attachmentData.position);
    formData.append('OrderAttachments', attachmentData.orderAttachments);
    
    // Solo agregar el archivo si hay uno nuevo
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Attachments/${id}`, {
      method: 'PUT',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al actualizar el attachment');
    }

    return response.status === 204 
      ? { message: "Attachment actualizado exitosamente" }
      : await response.json();
  } catch (error) {
    console.error('Error updating attachment:', error);
    throw error;
  }
};

// Función para procesar el attachment de un idioma específico
export const processAttachment = async (languageId, attachmentData, file) => {
  try {

    // Si no hay attachment o no hay cambios, no hacer nada
    if (!attachmentData) return null;

    let baseAttachmentData;

    if(attachmentData.imageUrl) {
      baseAttachmentData = {
        storyId: attachmentData.storyId,
        languageId: languageId,
        typeImage: 'Cover',
        position: '00',
        orderAttachments: 1,
        imageUrl: attachmentData.imageUrl
      };
    } else {
      baseAttachmentData = {
        storyId: attachmentData.storyId,
        languageId: languageId,
        typeImage: 'Cover',
        position: '00',
        orderAttachments: 1
      };
    }

    if (attachmentData.id) {
      // Si tiene ID, es un adjunto existente
      if (file) {
        // Si hay un archivo nuevo, actualizar el adjunto
        return await updateAttachment(attachmentData.id, baseAttachmentData, file);
      } else {
        // Si no hay archivo nuevo y ya existe el adjunto, no hacer nada
        return attachmentData;
      }
    } else {
      // Crear nuevo attachment
      return await createAttachment(
        baseAttachmentData,
        file
      );
    }
  } catch (error) {
    console.error(`Error processing attachment for language ${languageId}:`, error);
    throw error;
  }
};

// Servicios para Pages
export const fetchPages = async (storyId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/Pages`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Error fetching pages');
    const data = await response.json();
    return data.data.filter(page => page.storyId === storyId);
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

export const createPage = async (pageData, imageFile) => {
  try {
    let formData;
    
    // Determinar si estamos trabajando con un archivo o una URL
    if (imageFile) {
      // Caso 1: Se proporciona un archivo de imagen
      validateImageFile(imageFile);
      formData = new FormData();
      formData.append('StoryId', pageData.storyId);
      formData.append('PageOrder', pageData.pageOrder);
      formData.append('imageFile', imageFile);
      
    } else {
      // Caso 2: Se proporciona la URL de la imagen en pageData
      if (!pageData.imageUrl) {
        throw new Error('Se requiere imageUrl cuando no se proporciona un archivo de imagen');
      }
      
      formData = new FormData();
      formData.append('StoryId', pageData.storyId);
      formData.append('PageOrder', pageData.pageOrder);
      formData.append('imageUrl', pageData.imageUrl);
      
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Pages`, {
      method: 'POST',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al crear la página');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
};

export const updatePage = async (id, pageData, imageFile = null) => {
  try {
    // Crear FormData con todos los datos
    const formData = new FormData();
    formData.append('StoryId', pageData.storyId);
    formData.append('PageOrder', pageData.pageOrder);
    
    // Solo agregar el archivo si hay uno nuevo
    if (imageFile) {
      validateImageFile(imageFile);
      formData.append('imageFile', imageFile);
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/Pages/${id}`, {
      method: 'PUT',
      headers: getFormDataHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || 'Error al actualizar la página');
    }

    return response.status === 204 
      ? { id, ...pageData }
      : await response.json();
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
};

  export const deletePage = async (pageId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Pages/${pageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Error deleting page');
      }
      return true;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  };

  export const fetchPageContentsByStoryAndLanguage = async (storyId, languageId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/PageContents/ByStory/${storyId}?languageId=${languageId}`, {
        method: 'GET',
        headers: getHeaders()
      });
  
      if (!response.ok) throw new Error('Error fetching pages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching page contents:', error);
      throw error;
    }
  };

export const createPageContent = async (contentData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/PageContents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contentData)
    });

    if (!response.ok) throw new Error('Error creating page content');
    return await response.json();
  } catch (error) {
    console.error('Error creating page content:', error);
    console.log('DATA error: '+contentData.languageId);
    throw error;
  }
};

export const updatePageContent = async (contentId, contentData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/PageContents/${contentId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(contentData)
      });
  
      if (!response.ok) {
        throw new Error(`Error updating page content: ${response.status} ${response.statusText}`);
      }
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return { message: "Page content updated successfully" };
      }
    } catch (error) {
      console.error('Error updating page content:', error);
      throw error;
    }
};