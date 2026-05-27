import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const StoryPagesForm = ({pages}) => {
  // Estado para manejar las páginas
  const [storyPages, setStoryPages] = useState(pages || []);
  const [currentPageFile, setCurrentPageFile] = useState(null);
  const [currentPreviewSource, setCurrentPreviewSource] = useState('');

  // Función para manejar la subida de imagen de página
  const handlePageImageChange = (e, pageIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setCurrentPreviewSource(reader.result);
        // Actualizar la imagen de la página específica
        const updatedPages = [...storyPages];
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          imageFile: file,
          imagePreview: reader.result
        };
        setStoryPages(updatedPages);
      };
    }
  };

  // Función para añadir una nueva página
  const handleAddPage = () => {
    if (storyPages.length < countPages) {
      const newPage = {
        pageOrder: storyPages.length + 1,
        imageFile: null,
        imagePreview: '',
        pageContents: selectedLanguages.map(langId => ({
          languageId: langId,
          content: '',
          countWords: 0
        }))
      };
      setStoryPages([...storyPages, newPage]);
    }
  };

  // Función para actualizar el contenido de una página en un idioma específico
  const handleContentChange = (pageIndex, languageId, content) => {
    const updatedPages = [...storyPages];
    const pageContent = updatedPages[pageIndex].pageContents.find(
      pc => pc.languageId === languageId
    );
    if (pageContent) {
      pageContent.content = content;
      pageContent.countWords = content.trim().split(/\s+/).length;
    }
    setStoryPages(updatedPages);
  };

  return (
    <div className="pages-section mt-8">
      <h2 className="text-2xl font-bold mb-4">Páginas del cuento</h2>
      
      {storyPages.map((page, pageIndex) => (
        <Card key={pageIndex} className="mb-6">
          <CardHeader>
            <h3 className="text-xl font-semibold">
              Página {page.pageOrder} de {countPages}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Subida de imagen */}
              <div className="image-upload">
                <label className="block mb-2">
                  Imagen de la página:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePageImageChange(e, pageIndex)}
                    className="mt-1 block w-full"
                  />
                </label>
                {page.imagePreview && (
                  <img
                    src={page.imagePreview}
                    alt={`Preview página ${page.pageOrder}`}
                    className="mt-2 h-40 object-contain"
                  />
                )}
              </div>

              {/* Contenido en diferentes idiomas */}
              <div className="language-contents space-y-4">
                {selectedLanguages.map(langId => {
                  const language = languages.find(l => l.id === langId);
                  const pageContent = page.pageContents.find(
                    pc => pc.languageId === langId
                  );
                  
                  return (
                    <div key={langId} className="language-content">
                      <label className="block">
                        Contenido en {language.name}:
                        <textarea
                          value={pageContent?.content || ''}
                          onChange={(e) => handleContentChange(pageIndex, langId, e.target.value)}
                          className="mt-1 block w-full h-32 p-2 border rounded-md"
                          placeholder={`Escribe el contenido de la página ${page.pageOrder} en ${language.name}`}
                        />
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Palabras: {pageContent?.countWords || 0}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {storyPages.length < countPages && (
        <button
          type="button"
          onClick={handleAddPage}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Añadir página
        </button>
      )}
    </div>
  );
};

export default StoryPagesForm;