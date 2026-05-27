import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategoryById, updateCategory } from '../../services/categoryServices';
import ModalConfirmation from "../../components/ModalConfirmation/ModalConfirmation";
import './EditarCategoria.css';

function EditarCategoria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const loadCategory = useCallback(async () => {
        try {
            const data = await fetchCategoryById(id);
            setName(data.data.name);
            setCode(data.data.code);
        } catch (error) {
            console.error('Error loading category:', error);
            setMensaje('Error al cargar la categoría');
            setIsPopupOpen(true);
        }
    }, [id]);

    useEffect(() => {
    loadCategory();
    }, [loadCategory]);


    const handleCancel = () => {
        navigate('/categorias');
      }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const categoryData = {
                name,
                code
            };

            await updateCategory(id, categoryData);
            setMensaje('Categoría actualizada exitosamente');
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error al actualizar la categoría:', error);
            setMensaje('Error al actualizar la categoría');
            setIsPopupOpen(true);
        }
    };

    return (
        <div className="nuevo-cuento-page">
            <h1>Editar categoría</h1>
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

            <div className="form-group">
                <label>
                    Código:
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
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
            onClose={() => navigate('/categorias')} 
            message={mensaje}
          /> 
        </div>
    );
}

export default EditarCategoria;