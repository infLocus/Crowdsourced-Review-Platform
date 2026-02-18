import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import './BusinessDetail.css';

const BusinessDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    quality: 5,
    service: 5,
    value: 5,
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/${id}`);
      if (response.data.success) {
        setBusiness(response.data.business);
        setReviews(response.data.reviews);
        setRatingStats(response.data.ratingStats);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('/reviews', {
        businessId: id,
        ...reviewForm
      });

      if (response.data.success) {
        setSuccess('Review submitted successfully! It will be visible after approval.');
        setShowReviewForm(false);
        setReviewForm({
          rating: 5,
          quality: 5,
          service: 5,
          value: 5,
          title: '',
          content: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      restaurant: '🍽️',
      shop: '🛍️',
      service: '🔧',
      healthcare: '🏥',
      entertainment: '🎭',
      other: '📍'
    };
    return icons[categoryName] || '📍';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-detail-page">
        <div className="container">
          <div className="empty-state">
            <h2>Business not found</h2>
            <Link to="/businesses" className="btn btn-primary mt-md">
              Browse Businesses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-detail-page">
      {/* Hero Section */}
      <div className="business-hero">
        <div className="business-hero-bg">
          {business.images && business.images.length > 0 ? (
            <img src={business.images[0]} alt={business.name} />
          ) : (
            <div className="hero-placeholder">
              <span>{getCategoryIcon(business.category)}</span>
            </div>
          )}
        </div>
        <div className="business-hero-overlay"></div>
        <div className="business-hero-content">
          <div className="container">
            <span className="business-category-tag">
              {getCategoryIcon(business.category)} {business.category}
            </span>
            <h1>{business.name}</h1>
            <div className="business-hero-meta">
              <span className="location">📍 {business.city}, {business.state}</span>
              {business.phone && <span className="phone">📞 {business.phone}</span>}
            </div>
            <div className="business-hero-rating">
              <StarRating rating={Math.round(business.averageRating)} size="lg" />
              <span className="rating-number">{business.averageRating.toFixed(1)}</span>
              <span className="review-count">({business.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="business-detail-layout">
          {/* Main Content */}
          <div className="business-main">
            {/* About Section */}
            <section className="detail-section">
              <h2>About</h2>
              <p className="business-description">
                {business.description || 'No description available.'}
              </p>
            </section>

            {/* Rating Breakdown */}
            {ratingStats && ratingStats.count > 0 && (
              <section className="detail-section">
                <h2>Rating Breakdown</h2>
                <div className="rating-breakdown">
                  <div className="rating-overall">
                    <span className="rating-value">{ratingStats.avgRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(ratingStats.avgRating)} size="md" />
                    <span className="total-reviews">{ratingStats.count} reviews</span>
                  </div>
                  <div className="rating-criteria">
                    <div className="criteria-item">
                      <span className="criteria-label">Quality</span>
                      <div className="criteria-bar">
                        <div 
                          className="criteria-fill" 
                          style={{ width: `${(ratingStats.avgQuality / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="criteria-value">{ratingStats.avgQuality.toFixed(1)}</span>
                    </div>
                    <div className="criteria-item">
                      <span className="criteria-label">Service</span>
                      <div className="criteria-bar">
                        <div 
                          className="criteria-fill" 
                          style={{ width: `${(ratingStats.avgService / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="criteria-value">{ratingStats.avgService.toFixed(1)}</span>
                    </div>
                    <div className="criteria-item">
                      <span className="criteria-label">Value</span>
                      <div className="criteria-bar">
                        <div 
                          className="criteria-fill" 
                          style={{ width: `${(ratingStats.avgValue / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="criteria-value">{ratingStats.avgValue.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="detail-section">
              <div className="section-header">
                <h2>Reviews</h2>
                {isAuthenticated && !showReviewForm && (
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="btn btn-primary"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="review-form-card">
                  <h3>Write a Review</h3>
                  {error && <div className="form-error-message">{error}</div>}
                  {success && <div className="form-success-message">{success}</div>}
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="rating-inputs">
                      <div className="rating-input-group">
                        <label>Overall Rating *</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= reviewForm.rating ? 'filled' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="rating-label">{getRatingLabel(reviewForm.rating)}</span>
                      </div>
                      
                      <div className="rating-input-group">
                        <label>Quality</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= reviewForm.quality ? 'filled' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, quality: star })}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="rating-input-group">
                        <label>Service</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= reviewForm.service ? 'filled' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, service: star })}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="rating-input-group">
                        <label>Value</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= reviewForm.value ? 'filled' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, value: star })}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Summarize your experience"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Review *</label>
                      <textarea
                        className="form-textarea"
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                        placeholder="Share your detailed experience..."
                        required
                        maxLength={2000}
                        rows={5}
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!isAuthenticated && (
                <div className="login-prompt">
                  <p>
                    <Link to="/login" state={{ from: { pathname: `/businesses/${id}` } }}>
                      Sign in
                    </Link>{' '}
                    to write a review
                  </p>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.user?.avatar ? (
                              <img src={review.user.avatar} alt={review.user.username} />
                            ) : (
                              <span>{review.user?.username?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <span className="reviewer-name">{review.user?.username}</span>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="review-rating">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-content">{review.content}</p>
                      {review.photos && review.photos.length > 0 && (
                        <div className="review-photos">
                          {review.photos.map((photo, index) => (
                            <img key={index} src={photo} alt={`Review ${index + 1}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="business-sidebar">
            <div className="sidebar-card">
              <h3>Contact Information</h3>
              <div className="contact-list">
                {business.address && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <span>{business.address}, {business.city}, {business.state} {business.zipCode}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <a href={`tel:${business.phone}`}>{business.phone}</a>
                  </div>
                )}
                {business.email && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <a href={`mailto:${business.email}`}>{business.email}</a>
                  </div>
                )}
                {business.website && (
                  <div className="contact-item">
                    <span className="contact-icon">🌐</span>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Business Hours</h3>
              <p className="hours-notice">Hours not available</p>
            </div>

            <div className="sidebar-card map-placeholder">
              <span>🗺️ Map View</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;

