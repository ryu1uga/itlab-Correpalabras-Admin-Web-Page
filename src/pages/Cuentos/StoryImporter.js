import { useState } from 'react';
import { 
  createStoryWithThumbnail,
  assignLanguagesToStory,
  createPage,
  createPageContent,
  processAttachment
} from '../../services/storyServices';

// Mapeo de IDs de idiomas del JSON a IDs del sistema
const LANGUAGE_ID_MAPPING = {
  1: "5dde49e2-3b87-49fa-9c91-6f85ae7d0062", // Español
  3: "d16f4bbb-ba33-4500-a5aa-371b450ea6f2"  // Quechua
};

const FIXED_LAST_PAGE_IMAGE = "http://correpalabrasprd.ulima.edu.pe/V2/story/vistafinal.jpg";

// Configuración del proxy CORS
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const StoryImporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });
  const [jsonString, setJsonString] = useState('');
  const [importMethod, setImportMethod] = useState('file');
  const [debugInfo, setDebugInfo] = useState([]);

  // Función para agregar información de debug
  const addDebugInfo = (message, type = 'info') => {
    setDebugInfo(prev => [...prev, { 
      timestamp: new Date().toISOString(), 
      message, 
      type 
    }]);
  };

  // Función mejorada para descargar imágenes con manejo de CORS
  const downloadImage = async (url, description = '') => {
    addDebugInfo(`Intentando descargar: ${description || url}`, 'info');
    
    try {
      // Primero intentar directamente
      addDebugInfo(`Intento directo para: ${url}`, 'info');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/*'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Verificar that el blob contiene datos de imagen
      if (blob.size === 0) {
        throw new Error('Blob vacío recibido');
      }

      const filename = url.split('/').pop() || 'image.jpg';
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      
      addDebugInfo(`✓ Descarga directa exitosa: ${filename} (${blob.size} bytes)`, 'success');
      return file;
      
    } catch (directError) {
      addDebugInfo(`✗ Descarga directa falló: ${directError.message}`, 'warning');
      
      try {
        // Intentar con el proxy CORS
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
        addDebugInfo(`Intento con proxy: ${proxyUrl}`, 'info');
        
        const proxyResponse = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*'
          }
        });

        if (!proxyResponse.ok) {
          throw new Error(`Proxy HTTP error! status: ${proxyResponse.status}`);
        }

        const blob = await proxyResponse.blob();
        
        // Verificar que el blob contiene datos
        if (blob.size === 0) {
          throw new Error('Proxy devolvió blob vacío');
        }

        const filename = url.split('/').pop() || 'image.jpg';
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
        
        addDebugInfo(`✓ Descarga con proxy exitosa: ${filename} (${blob.size} bytes)`, 'success');
        return file;
        
      } catch (proxyError) {
        addDebugInfo(`✗ Descarga con proxy falló: ${proxyError.message}`, 'error');
        
        // Si ambos métodos fallan, crear un archivo placeholder
        addDebugInfo(`Creando imagen placeholder para: ${url}`, 'warning');
        return await createPlaceholderImage(url);
      }
    }
  };

  // Función mejorada para crear una imagen placeholder
  const createPlaceholderImage = async (originalUrl) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // Fondo gris claro
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Bordes
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      // Texto principal
      ctx.fillStyle = '#6c757d';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Imagen no disponible', canvas.width/2, canvas.height/2 - 20);
      
      // URL original (truncada si es muy larga)
      ctx.font = '14px Arial';
      const truncatedUrl = originalUrl.length > 60 ? 
        originalUrl.substring(0, 57) + '...' : originalUrl;
      ctx.fillText(truncatedUrl, canvas.width/2, canvas.height/2 + 20);
      
      canvas.toBlob((blob) => {
        const filename = originalUrl.split('/').pop() || 'placeholder.png';
        const file = new File([blob], filename, { type: 'image/png' });
        addDebugInfo(`✓ Placeholder creado: ${filename}`, 'warning');
        resolve(file);
      }, 'image/png', 0.8);
    });
  };

  // Función para mapear el ID del idioma
  const mapLanguageId = (originalId) => {
    const mappedId = LANGUAGE_ID_MAPPING[originalId];
    if (!mappedId) {
      throw new Error(`ID de idioma no reconocido: ${originalId}`);
    }
    return mappedId;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const jsonData = JSON.parse(e.target.result);
          await processStoryJson(jsonData);
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        addDebugInfo(`Error al leer archivo: ${error.message}`, 'error');
        alert('Error al leer el archivo JSON');
      }
    }
  };

  const handleJsonStringSubmit = async () => {
    if (!jsonString.trim()) {
      alert('Por favor, ingresa el JSON del cuento');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonString);
      await processStoryJson(jsonData);
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      addDebugInfo(`Error al parsear JSON: ${error.message}`, 'error');
      alert('Error al procesar el JSON. Asegúrate de que el formato sea válido.');
    }
  };

  // Función principal para procesar el JSON
  const processStoryJson = async (jsonData) => {
    try {
      setIsLoading(true);
      setDebugInfo([]); // Limpiar debug info anterior
      setProgress({ current: 0, total: 100, step: 'Iniciando importación...' });

      addDebugInfo('Iniciando importación de cuento', 'info');
      addDebugInfo(`Título: ${jsonData.title}`, 'info');
      addDebugInfo(`Páginas: ${jsonData.countPages}`, 'info');

      // 1. Descargar la imagen de miniatura
      setProgress({ current: 5, total: 100, step: 'Descargando miniatura...' });
      const thumbnailFile = await downloadImage(jsonData.thumbnail, 'Miniatura del cuento');

      // 2. Crear el cuento base
      setProgress({ current: 10, total: 100, step: 'Creando cuento...' });
      const storyData = {
        author: jsonData.author,
        illustrator: jsonData.illustrator,
        title: jsonData.title,
        countPages: jsonData.countPages
      };
      
      addDebugInfo('Enviando cuento al servidor...', 'info');
      const newStory = await createStoryWithThumbnail(storyData, thumbnailFile);
      const storyId = newStory.data.id;
      addDebugInfo(`✓ Cuento creado con ID: ${storyId}`, 'success');

      // 3. Procesar los idiomas y sus portadas
      setProgress({ current: 20, total: 100, step: 'Procesando idiomas y portadas...' });
      const languages = jsonData.languages;
      
      // Mapear los IDs de idiomas originales a los IDs del sistema
      const mappedLanguageIds = languages.map(lang => mapLanguageId(lang._id));
      addDebugInfo(`Idiomas mapeados: ${mappedLanguageIds.join(', ')}`, 'info');
      
      // Asignar idiomas al cuento
      await assignLanguagesToStory(storyId, mappedLanguageIds, [], []);
      addDebugInfo('✓ Idiomas asignados al cuento', 'success');

      // Procesar portadas para cada idioma
      for (const language of languages) {
        const mappedLanguageId = mapLanguageId(language._id);
        const coverAttachment = language.attachments.find(att => att.typeImage === 'Cover');

        if (coverAttachment) {
          addDebugInfo(`Procesando portada para idioma: ${mappedLanguageId}`, 'info');
          const coverFile = await downloadImage(coverAttachment.imageUri, `Portada idioma ${language._id}`);

          await processAttachment(mappedLanguageId, {
            storyId,
            languageId: mappedLanguageId,
            typeImage: 'Cover',
            position: '00',
            orderAttachments: 0
          }, coverFile);
          
          addDebugInfo(`✓ Portada procesada para idioma: ${mappedLanguageId}`, 'success');
        }
      }

      // 4. Procesar las páginas y sus contenidos
      setProgress({ current: 40, total: 100, step: 'Procesando páginas...' });
      const storyImages = jsonData.storyImages.slice(0, -1); // Excluir la última imagen del array original
      const totalSteps = storyImages.length + 1; // +1 para incluir la página final
      const incrementPerStep = 50 / totalSteps;

      // Procesar páginas regulares
      for (let i = 0; i < storyImages.length; i++) {
        const imageData = storyImages[i];
        const pageOrder = i + 1;

        addDebugInfo(`Procesando página ${pageOrder}/${storyImages.length}`, 'info');
        const pageImageFile = await downloadImage(imageData.imageUri, `Página ${pageOrder}`);
        
        const newPage = await createPage({
          storyId,
          pageOrder
        }, pageImageFile);

        addDebugInfo(`✓ Página ${pageOrder} creada con ID: ${newPage.data.id}`, 'success');

        // Crear contenido para cada idioma
        for (const language of languages) {
          const mappedLanguageId = mapLanguageId(language._id);
          const pageContent = language.pages.find(p => p.pageNOrder === pageOrder);
          if (pageContent) {
            await createPageContent({
              pageId: newPage.data.id,
              languageId: mappedLanguageId,
              countWords: pageContent.countWords,
              content: pageContent.textcontent
            });
          }
        }

        setProgress({
          current: 40 + (i + 1) * incrementPerStep,
          total: 100,
          step: `Procesando página ${pageOrder}/${totalSteps}...`
        });
      }

      // 5. Procesar la última página con imagen fija
      addDebugInfo('Procesando página final...', 'info');
      const lastPageOrder = storyImages.length + 1;
      const lastPageImageFile = await downloadImage(FIXED_LAST_PAGE_IMAGE, 'Imagen final fija');

      const lastPage = await createPage({
        storyId, 
        pageOrder: lastPageOrder
      }, lastPageImageFile);

      addDebugInfo(`✓ Página final creada con ID: ${lastPage.data.id}`, 'success');

      // Crear contenidos para la última página
      for (const language of languages) {
        const mappedLanguageId = mapLanguageId(language._id);
        const lastPageContent = language.pages.find(p => p.pageNOrder === lastPageOrder);
        if (lastPageContent) {
          await createPageContent({
            pageId: lastPage.data.id,
            languageId: mappedLanguageId,
            content: lastPageContent.textcontent,
            countWords: lastPageContent.countWords
          });
        }
      }

      setProgress({ current: 100, total: 100, step: 'Importación completada!' });
      addDebugInfo('🎉 ¡Importación completada exitosamente!', 'success');
      alert('Cuento importado exitosamente!');
      
    } catch (error) {
      console.error('Error processing story:', error);
      addDebugInfo(`❌ Error crítico: ${error.message}`, 'error');
      alert(`Error al procesar el cuento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Importar Cuento desde JSON</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de importación */}
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setImportMethod('file')}
              className={`px-4 py-2 rounded ${
                importMethod === 'file' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Importar desde archivo
            </button>
            <button
              onClick={() => setImportMethod('text')}
              className={`px-4 py-2 rounded ${
                importMethod === 'text' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pegar JSON
            </button>
          </div>

          {importMethod === 'file' ? (
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          ) : (
            <div>
              <textarea
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                disabled={isLoading}
                placeholder="Pega aquí el JSON del cuento..."
                className="w-full h-64 p-4 border rounded-lg mb-4"
              />
              <button
                onClick={handleJsonStringSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Procesar JSON
              </button>
            </div>
          )}

          {isLoading && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium text-gray-700">{progress.step}</span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress.current)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.current}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Panel de debug */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
            <h2 className="font-medium">Log de Importación</h2>
            <button
              onClick={clearDebugInfo}
              className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Limpiar
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 font-mono text-sm">
            {debugInfo.length === 0 ? (
              <div className="text-gray-500 italic">
                Los mensajes de debug aparecerán aquí durante la importación...
              </div>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-400 text-xs">
                    {new Date(info.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`ml-2 ${
                    info.type === 'success' ? 'text-green-600' :
                    info.type === 'error' ? 'text-red-600' :
                    info.type === 'warning' ? 'text-yellow-600' :
                    'text-gray-700'
                  }`}>
                    {info.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryImporter;