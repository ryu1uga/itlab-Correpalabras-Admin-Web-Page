import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchLanguages, deleteLanguage } from '../../services/languageServices';
import LanguageCard from "../../components/LanguageCard/LanguageCard";
import ConfirmationPopup from "../../components/ConfirmationPopup/ConfirmationPopup";
import './Idiomas.css';

function Idiomas() {
    const navigate = useNavigate();
    const [languages, setLanguages] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [languageToDelete, setLanguageToDelete] = useState(null);

    useEffect(() => {
        loadLanguages();
    }, []);

    const loadLanguages = async () => {
        try {
            const data = await fetchLanguages();
            setLanguages(data.data);
        } catch (error) {
            console.error('Error loading languages:', error);
        }
    };

    const handleDelete = async (languageId) => {
        try {
            await deleteLanguage(languageId);
            setLanguages(languages.filter(language => language.id !== languageId));
        } catch (error) {
            console.error('Error deleting language:', error);
        }
    };

    const handleConfirmDelete = async () => {
        if (languageToDelete) {
            await handleDelete(languageToDelete);
            setIsPopupOpen(false);
            setLanguageToDelete(null);
        }
    };

    const handleEliminar = (id) => {
        setLanguageToDelete(id);
        setIsPopupOpen(true);
    };

    const NuevoIdioma = () => {
        navigate('/crear-idioma');
    };

    return (
        <div className='categorias-page'>
            <h1>Idiomas</h1>
            <div className="nueva-cat">
                <button onClick={NuevoIdioma}>Nuevo Idioma</button>
            </div>
            <div className="categories-container">
                {languages.map(language => (
                    <LanguageCard
                        key={language.id}
                        language={language}
                        onDelete={() => handleEliminar(language.id)}
                    />
                ))}
            </div>
            <ConfirmationPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onConfirm={handleConfirmDelete}
                entityType="idioma"
            />
        </div>
    );
}

export default Idiomas;