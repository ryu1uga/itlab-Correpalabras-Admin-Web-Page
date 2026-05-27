import { useNavigate } from 'react-router-dom';
import './CategoryCard.css'; 

function CategoryCard({ category, onDelete }) {
    const navigate = useNavigate();

    // Función para manejar la edición de categorías
    const handleEditar = (id) => {
        navigate(`/editar-categoria/${id}`);
    };

    return (
        <div className="category-card-container">
            <div className="category-details">
                <h2 className="category-name">{category.name}</h2>
                <p className="category-code"><strong>Código:</strong> {category.code}</p>
                <div className="button-container">
                    <button onClick={() => handleEditar(category.id)}>Editar</button>
                    <button onClick={onDelete}>Eliminar</button>
                </div>
            </div>
        </div>
    );
}

export default CategoryCard;
