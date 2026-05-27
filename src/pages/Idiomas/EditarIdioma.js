import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLanguageById, updateLanguage } from '../../services/languageServices';
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";

function EditarIdioma() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (hasError) {
            navigate('/idiomas');
        }
    }, [hasError, navigate]);

    useEffect(() => {
        loadlanguage();
    }, [id]);

    const loadlanguage = async () => {
        try {
            const data = await fetchLanguageById(id);
            setName(data.data.name);
        } catch (error) {
            console.error('Error loading language:', error);
            setMensaje('Error al cargar el idioma');
            setIsPopupOpen(true);
            setHasError(true); 
        }
    };

    const handleCancel = () => {
        navigate('/idiomas');
      }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const languageData = {
                name
            };

            await updateLanguage(id, languageData);
            setMensaje('Idioma actualizado exitosamente');
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error al actualizar el idioma:', error);
            setMensaje('Error al actualizar el idioma');
            setIsPopupOpen(true);
        }
    };

    return (
        <div className="nuevo-cuento-page">
            <h1>Editar idioma</h1>
            <form onSubmit={handleSubmit} className="nuevo-cuento-form">

            <div className="form-group">
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
            </div>

            <div className="form-group-buttons">
            <button type="submit" className="submit-button2">Guardar Cambios</button>

                <button type='button' className="submit-button2" onClick={handleCancel}>Cancelar</button>
            </div>

                
            </form>
            <ModalConfirmation
            isOpen={isPopupOpen} 
            onClose={() => navigate('/idiomas')} 
            message={mensaje}
          /> 
        </div>
    );
}

export default EditarIdioma;