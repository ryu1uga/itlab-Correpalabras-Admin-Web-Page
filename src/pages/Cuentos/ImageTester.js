import { useState } from 'react';

const ImageTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState('');
  const [selectedProxy, setSelectedProxy] = useState('allorigins');
  const [autoDownload, setAutoDownload] = useState(true);
  const [retryWithDifferentProxies, setRetryWithDifferentProxies] = useState(true);

  const CORS_PROXIES = {
    none: '',
    'allorigins': 'https://api.allorigins.win/raw?url=',
    'allorigins-get': 'https://api.allorigins.win/get?url=',
    'corsproxy.io': 'https://corsproxy.io/?',
    'cors-anywhere': 'https://cors-anywhere.herokuapp.com/',
    'thingproxy': 'https://thingproxy.freeboard.io/fetch/',
    'proxy-cors': 'https://proxy-cors.vercel.app/api/cors?url='
  };

  // URLs de ejemplo que podemos probar
  const SAMPLE_URLS = [
    'http://correpalabrasprd.ulima.edu.pe/V2/story/thumbnails/THAPURADOS.jpg',
    'http://correpalabrasprd.ulima.edu.pe/V2/story/pages/APURADOS/PORTAPURADOS.jpg',
    'http://correpalabrasprd.ulima.edu.pe/V2/story/pages/APURADOS/1Apurados.jpg'
  ].join('\n');

  const addResult = (url, status, message, blob = null, proxyUsed = null) => {
    setTestResults(prev => [{
      timestamp: new Date().toISOString(),
      url,
      status,
      message,
      blob,
      proxyUsed
    }, ...prev]);
  };

  const downloadImage = (blob, originalUrl) => {
    try {
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      
      const urlParts = originalUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'imagen';
      
      link.href = objectUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      return false;
    }
  };

  const tryWithProxy = async (url, proxyKey) => {
    const proxy = CORS_PROXIES[proxyKey];
    let finalUrl;
    let requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (proxyKey === 'none') {
      finalUrl = url;
    } else if (proxyKey === 'allorigins-get') {
      // Para allorigins con formato JSON
      finalUrl = `${proxy}${encodeURIComponent(url)}`;
      requestOptions.headers['Accept'] = 'application/json';
    } else {
      finalUrl = `${proxy}${encodeURIComponent(url)}`;
    }

    const response = await fetch(finalUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (proxyKey === 'allorigins-get') {
      // Manejar respuesta JSON de allorigins
      const data = await response.json();
      if (data.status && data.status.http_code === 200) {
        // Decodificar el contenido base64 si está presente
        if (data.contents) {
          const byteCharacters = atob(data.contents);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray]);
        }
      }
      throw new Error(`Proxy error: ${data.status ? data.status.http_code : 'Unknown'}`);
    } else {
      return await response.blob();
    }
  };

  const testImageDownload = async (url) => {
    const proxiesToTry = retryWithDifferentProxies 
      ? Object.keys(CORS_PROXIES)
      : [selectedProxy];

    // Empezar con el proxy seleccionado
    if (selectedProxy !== proxiesToTry[0]) {
      proxiesToTry.unshift(selectedProxy);
      proxiesToTry.splice(proxiesToTry.indexOf(selectedProxy, 1), 1);
    }

    for (const proxyKey of proxiesToTry) {
      try {
        addResult(url, 'info', `Intentando con ${proxyKey === 'none' ? 'fetch directo' : proxyKey}...`);
        
        const blob = await tryWithProxy(url, proxyKey);
        
        // Verificar que es realmente una imagen
        if (!blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
          throw new Error(`Tipo de contenido inválido: ${blob.type}`);
        }

        const objectUrl = URL.createObjectURL(blob);
        
        if (autoDownload) {
          const downloadSuccess = downloadImage(blob, url);
          if (downloadSuccess) {
            addResult(url, 'success', `Descarga exitosa con ${proxyKey} - Archivo descargado automáticamente`, objectUrl, proxyKey);
          } else {
            addResult(url, 'success', `Descarga exitosa con ${proxyKey} - Error al guardar archivo`, objectUrl, proxyKey);
          }
        } else {
          addResult(url, 'success', `Descarga exitosa con ${proxyKey}`, objectUrl, proxyKey);
        }
        
        return { success: true, blob, objectUrl, proxyUsed: proxyKey };
        
      } catch (error) {
        addResult(url, 'warning', `${proxyKey}: ${error.message}`);
        
        // Si no estamos probando múltiples proxies, salir después del primer error
        if (!retryWithDifferentProxies) {
          addResult(url, 'error', `Error final: ${error.message}`);
          return { success: false, error };
        }
      }
    }
    
    addResult(url, 'error', 'Todos los métodos fallaron');
    return { success: false, error: 'Todos los proxies fallaron' };
  };

  const handleTest = async () => {
    setIsLoading(true);
    const urls = imageUrls.split('\n').filter(url => url.trim());
    
    for (const url of urls) {
      if (url.trim()) {
        await testImageDownload(url.trim());
        // Pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsLoading(false);
  };

  const handleManualDownload = (result) => {
    if (result.blob) {
      fetch(result.blob)
        .then(res => res.blob())
        .then(blob => {
          const success = downloadImage(blob, result.url);
          if (success) {
            addResult(result.url, 'info', 'Descarga manual completada');
          }
        })
        .catch(err => {
          addResult(result.url, 'error', 'Error en descarga manual: ' + err.message);
        });
    }
  };

  const loadSampleUrls = () => {
    setImageUrls(SAMPLE_URLS);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Descargador de Imágenes Mejorado</h1>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proxy CORS preferido
          </label>
          <select
            value={selectedProxy}
            onChange={(e) => setSelectedProxy(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {Object.keys(CORS_PROXIES).map(key => (
              <option key={key} value={key}>
                {key === 'none' ? 'Sin proxy' : key}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoDownload}
              onChange={(e) => setAutoDownload(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Descarga automática</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={retryWithDifferentProxies}
              onChange={(e) => setRetryWithDifferentProxies(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Probar todos los proxies</span>
          </label>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadSampleUrls}
            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            URLs ejemplo
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearResults}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URLs de imágenes (una por línea)
        </label>
        <textarea
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          className="w-full h-32 px-3 py-2 border rounded-md"
          placeholder="http://ejemplo.com/imagen1.jpg&#10;http://ejemplo.com/imagen2.jpg"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isLoading}
        className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Descargando...' : 'Probar y descargar imágenes'}
      </button>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h2 className="font-medium">Resultados ({testResults.length})</h2>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  result.status === 'success' ? 'bg-green-500' : 
                  result.status === 'error' ? 'bg-red-500' : 
                  result.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></span>
                <span className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                {result.proxyUsed && (
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{result.proxyUsed}</span>
                )}
                {result.status === 'success' && result.blob && !autoDownload && (
                  <button
                    onClick={() => handleManualDownload(result)}
                    className="ml-auto px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Descargar
                  </button>
                )}
              </div>
              <div className="text-sm mb-1 font-mono break-all">{result.url}</div>
              <div className={`text-sm ${
                result.status === 'success' ? 'text-green-600' : 
                result.status === 'error' ? 'text-red-600' : 
                result.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
              }`}>{result.message}</div>
              {result.blob && (
                <div className="mt-2">
                  <img 
                    src={result.blob} 
                    alt="Preview" 
                    className="max-w-48 max-h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          ))}
          {testResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No hay resultados aún. Agrega URLs y presiona el botón para descargar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTester;