import './ConfirmationPopup.css'; 

const ConfirmationPopup = ({ isOpen, onClose, onConfirm, entityType }) => {
    if (!isOpen) return null; 

    // Determinar el mensaje según el tipo de entidad

    let confirmationMessage = `¿Estás seguro de que deseas eliminar esta ${entityType}?`;

    if(entityType === "cuento" || entityType === "idioma"){
        confirmationMessage = `¿Estás seguro de que deseas eliminar este ${entityType}?`;
    }else{
        confirmationMessage = `¿Estás seguro de que deseas eliminar esta ${entityType}?`;
    }
    

    return (
        <div className="confirmation-popup-overlay">
            <div className="confirmation-popup">
                <h3>Confirmar Eliminación</h3>
                <p>{confirmationMessage}</p>
                <div className="popup-buttons">
                    <button onClick={onConfirm}>Eliminar</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;

