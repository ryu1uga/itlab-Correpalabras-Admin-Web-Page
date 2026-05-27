import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchMostReadStories } from '../../services/storyReportServices';
import { fetchProfilesCount } from '../../services/profileServices';
import { fetchMostDemandedLanguages } from '../../services/languageServices';
import { fetchMostVisitedCategories } from '../../services/categoryServices';
import './Reportes.css';

const mockData = {
  cuentos: [
    { nombre: "El Patito Feo", lecturas: 1250, edad_promedio: 5 },
    { nombre: "Caperucita Roja", lecturas: 980, edad_promedio: 6 },
    { nombre: "Los Tres Cerditos", lecturas: 850, edad_promedio: 4 },
    { nombre: "Blancanieves", lecturas: 720, edad_promedio: 7 },
    { nombre: "Cenicienta", lecturas: 650, edad_promedio: 8 }
  ],
  perfiles: {
    total: 2450,
    por_edad: [
      { rango: "0-3", cantidad: 380, masculino: 190, femenino: 190 },
      { rango: "4-6", cantidad: 820, masculino: 410, femenino: 410 },
      { rango: "7-9", cantidad: 750, masculino: 375, femenino: 375 },
      { rango: "10-12", cantidad: 500, masculino: 250, femenino: 250 }
    ]
  },
  idiomas: [
    { idioma: "Español", consultas: 1800, porcentaje: 60 },
    { idioma: "Inglés", consultas: 750, porcentaje: 25 },
    { idioma: "Francés", consultas: 300, porcentaje: 10 },
    { idioma: "Portugués", consultas: 150, porcentaje: 5 }
  ],
  categorias: [
    { categoria: "Aventuras", visitas: 1200 },
    { categoria: "Fantasía", visitas: 950 },
    { categoria: "Educativo", visitas: 800 },
    { categoria: "Animales", visitas: 600 },
    { categoria: "Familia", visitas: 450 }
  ]
};

function Reportes() {
  const [filtros, setFiltros] = useState({
    rangoEdad: 'todos',
    genero: 'todos',
    periodo: '30d',
    idioma: 'todos'
  });

  const [stories, setStories] = useState([])
  const [profiles, setProfiles] = useState([])
  const [languages, setLanguages] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
      loadMostReadStories();
      loadProfilesCount();
      loadMostDemandedLanguages();
      loadMostVisitedCategories();
    }, []);
  
    const loadMostReadStories = async () => {
      try {
        const data = await fetchMostReadStories();
        setStories(data);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    };

    const loadProfilesCount = async () => {
      try {
        const data = await fetchProfilesCount();
        setProfiles(data);
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    };

    const loadMostDemandedLanguages = async () => {
      try {
        const data = await fetchMostDemandedLanguages();
        setLanguages(data);
      } catch (error) {
        console.error('Error loading languages:', error);
      }
    };

    const loadMostVisitedCategories = async () => {
      try {
        const data = await fetchMostVisitedCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

  // Función para actualizar filtros
  const actualizarFiltro = (tipo, valor) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }));
  };

  // Datos filtrados 
  const datosFiltrados = useMemo(() => {
    // lógica de filtrado basada en datos reales
    return mockData;
  }, []);

  // Función para exportar datos
  // const exportarDatos = () => {
  //   console.log('Exportando datos...');
  // };

  return (
    <div className='reportes-page'>
      <h1>Reportes</h1>
      
      {/* Filtros */}
      <div className="filtros-section">
        <div className="filter-container">
          <label>Rango de Edad:</label>
          <select 
            value={filtros.rangoEdad} 
            onChange={(e) => actualizarFiltro('rangoEdad', e.target.value)}
          >
            <option value="todos">Todas las edades</option>
            <option value="0-3">0-3 años</option>
            <option value="4-6">4-6 años</option>
            <option value="7-9">7-9 años</option>
            <option value="10-12">10-12 años</option>
          </select>
        </div>

        <div className="filter-container">
          <label>Género:</label>
          <select 
            value={filtros.genero} 
            onChange={(e) => actualizarFiltro('genero', e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div className="filter-container">
          <label>Período:</label>
          <select 
            value={filtros.periodo} 
            onChange={(e) => actualizarFiltro('periodo', e.target.value)}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="1y">Último año</option>
          </select>
        </div>

        <div className="filter-container">
          <label>Idioma:</label>
          <select 
            value={filtros.idioma} 
            onChange={(e) => actualizarFiltro('idioma', e.target.value)}
          >
            <option value="todos">Todos los idiomas</option>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="fr">Francés</option>
            <option value="pt">Portugués</option>
          </select>
        </div>
      </div>

      {/* Botón de exportar */}
      {/* <div className="nuevo-cuento">
        <button onClick={exportarDatos}>
          📊 Exportar Reporte
        </button>
      </div> */}

      {/* Métricas principales */}
      <div className="metricas-container">
        <div className="metric-card">
          <h3>Total Perfiles</h3>
          <p className="metric-number">{profiles ? profiles.toLocaleString() : 0}</p>
        </div>
        <div className="metric-card">
          <h3>Cuentos Leídos</h3>
          <p className="metric-number">
            {stories.reduce((sum, c) => sum + c.reads, 0).toLocaleString()}
          </p>
        </div>
        <div className="metric-card">
          <h3>Idiomas Activos</h3>
          <p className="metric-number">{languages.length}</p>
        </div>
        <div className="metric-card">
          <h3>Categorías</h3>
          <p className="metric-number">{categories.length}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="graficos-container">
        {/* Cuentos más leídos */}
        <div className="grafico-card">
          <h3>Cuentos Más Leídos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reads" fill="#f35424" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Perfiles por edad */}
        <div className="grafico-card">
          <h3>Perfiles por Edad y Género</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosFiltrados.perfiles.por_edad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rango" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="masculino" stackId="a" fill="#f35424" name="Masculino" />
              <Bar dataKey="femenino" stackId="a" fill="#df704e" name="Femenino" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Idiomas */}
        <div className="grafico-card">
          <h3>Distribución de Idiomas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ languageName, porcentaje }) => `${languageName} `}
                outerRadius={80}
                fill="#8884d8"
                dataKey="requests"
              >
                {languages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#f35424', '#df704e', '#ff6b47', '#ff8566'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categorías */}
        <div className="grafico-card">
          <h3>Categorías Más Visitadas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="categoryName" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#f35424" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="tabla-resumen">
        <h3>Resumen Detallado</h3>
        <table>
          <thead>
            <tr>
              <th>Cuento</th>
              <th>Lecturas</th>
              <th>Popularidad</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((cuento, index) => (
              <tr key={index}>
                <td>{cuento.title}</td>
                <td>{cuento.reads.toLocaleString()}</td>
                <td>
                  <div className="popularity-bar">
                    <div 
                      className="popularity-fill" 
                      style={{ 
                        width: `${(cuento.reads / Math.max(...stories.map(c => c.reads))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reportes;