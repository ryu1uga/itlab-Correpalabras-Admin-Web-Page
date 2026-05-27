import { useNavigate } from 'react-router-dom';
import './StoryCard.css';

function StoryCard({ story, onDelete }) {
  const navigate = useNavigate();
  
  const handleEditar = (id) => {
    navigate(`/editar-cuento/${id}`);
  };
  
  return (
    <div className="story-card-container">
      <div className="thumbnail-container">
        <img className="story-thumbnail" src={story.thumbnail} alt={story.title} />
      </div>
      <div className="story-details">
        <h2 className="story-title">{story.title}</h2>
        {/* <h4 className="story-sub-title">{story.totalWords} palabras</h4> */}
        {/* <p className="story-author"><strong>Autor:</strong> {story.author || "Unknown"}</p>
        <p className="story-illustrator"><strong>Ilustrador:</strong> {story.illustrator || "Unknown"}</p>
        <p className="story-pages"><strong>Páginas:</strong> {story.countPages > 0 ? story.countPages : "0"}</p> */}
        <div className="button-container">
          <button onClick={() => handleEditar(story.id)}>Editar</button>
          <button onClick={onDelete}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default StoryCard;

