import { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import './Cuentos.css';
import StoryCard from "../../components/StoryCard/StoryCard";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import { fetchStories, deleteStory } from "../../services/storyServices";
import { fetchCategories } from "../../services/storyServices";

function Cuentos() {

  const defaultCategory = "2d3facb3-5d98-4a31-bb49-fe29e9d72eda"

  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const navigate = useNavigate();

  const filteredStories = useMemo(() => {
    return selectedCategory
      ? stories.filter(story =>
          story.storyCategories?.some(category => category.categoryId === selectedCategory)
        )
      : stories;
  }, [stories, selectedCategory]);

  const sortedStories = useMemo(() => {
    const base = [...filteredStories].sort(
      (a, b) => (a.totalWords ?? 0) - (b.totalWords ?? 0)
    );
    return sortAsc ? base : base.reverse();
  }, [filteredStories, sortAsc]);

  useEffect(() => {
    loadStories();
    loadCategories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await fetchStories();
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (storyToDelete) {
      try {
        await deleteStory(storyToDelete);
        await loadStories(); 
        setIsPopupOpen(false);
        setStoryToDelete(null);
      } catch (error) {
        console.error('Error al eliminar la historia:', error);
      }
    }
  };

  const handleEliminar = (id) => {
    setStoryToDelete(id);
    setIsPopupOpen(true);
  };

  const NuevoCuento = () => {
    navigate('/crear-cuento');
  };

  return (
    <div className="cuentos-page">
      <h1>Cuentos</h1>
      <div className="filter-container">
        <label htmlFor="category-select">Filtrar por categoría:</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="nuevo-cuento">
          <button onClick={NuevoCuento}>Nuevo cuento</button>
        </div>
        <button
          type="button"
          className="sort-toggle"
          onClick={() => setSortAsc(prev => !prev)}
          title="Ordenar por cantidad de palabras"
        >
          ↑↓
        </button>
      </div>

      {filteredStories.length === 0 ? (
        <div className="no-languages-warning">
          <p>No hay cuentos que pertenezcan a esa categoría. Por favor, seleccione otra.</p>
        </div>
      ) : (
        <>
          <div className="stories-container">
            {sortedStories.map(story => (
              <StoryCard 
                key={story.id}
                story={story} 
                onDelete={() => handleEliminar(story.id)}
              />
            ))}
          </div>
          <ConfirmationPopup 
            isOpen={isPopupOpen} 
            onClose={() => setIsPopupOpen(false)} 
            onConfirm={handleConfirmDelete} 
            entityType="cuento"
          /> 
      </>
      )}
    </div>
  );
}

export default Cuentos;