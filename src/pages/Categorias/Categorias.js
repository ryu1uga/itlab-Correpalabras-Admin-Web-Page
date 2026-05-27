import { useState, useEffect } from "react";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import { useNavigate } from "react-router-dom";
import { fetchCategories, deleteCategory } from '../../services/categoryServices';
import './Categorias.css';

function Categorias() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleDelete = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            setCategories(categories.filter(category => category.id !== categoryId));
        } catch (error) {
            console.error(`Error deleting category ${categoryId}:`, error);
        }
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            await handleDelete(categoryToDelete);
            setIsPopupOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleEliminar = (id) => {
        setCategoryToDelete(id);
        setIsPopupOpen(true);
    };

    const NuevaCategoria = () => {
        navigate('/crear-categoria');
    };

    return (
        <div className='categorias-page'>
            <h1>Categorías</h1>
            <div className="nueva-cat">
                <button onClick={NuevaCategoria}>Nueva categoría</button>
            </div>
            <div className="categories-container">
                {categories.map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onDelete={() => handleEliminar(category.id)}
                    />
                ))}
            </div>
            <ConfirmationPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)} 
                onConfirm={handleConfirmDelete}
                entityType="categoría"
            />
        </div>
    );
}

export default Categorias;
