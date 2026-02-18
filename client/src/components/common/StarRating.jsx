import './StarRating.css';

const StarRating = ({ rating, onRatingChange, interactive = false, size = 'md' }) => {
  const stars = [1, 2, 3, 4, 5];

  const getStarClass = (star) => {
    if (star <= rating) return 'filled';
    return '';
  };

  const handleClick = (star) => {
    if (interactive && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''} size-${size}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${getStarClass(star)}`}
          onClick={() => handleClick(star)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;

