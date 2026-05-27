import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './LanguageCard.css'; 

function LanguageCard({ language, onDelete }) {

    const navigate = useNavigate();

    const [edit, setEdit] = useState(false);
    
    useEffect(() => {
        if (edit) {
            navigate(`/editar-idioma/${language.id}`);
        }
    }, [edit, language.id, navigate]);

    const handleEditar = (id) => {
        setEdit(true)
    };

    return (
        <div className="category-card-container">
            <div className="category-details">
                <h2 className="category-name">{language.name}</h2>
                <div className="button-container">
                    <button onClick={() => handleEditar(language.id)}>Editar</button>
                    <button onClick={onDelete}>Eliminar</button> 
                </div>
            </div>
        </div>
    );
}

export default LanguageCard;