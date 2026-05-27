import './ModalConfirmation.css'; 

const ModalConfirmation = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null; 

    return (
        <div className="confirmation-popup-overlay">
            <div className="confirmation-popup">
                <h3>Mensaje</h3>
                <p>{message}</p>
                <div className="popup-buttons">
                    <button onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmation;