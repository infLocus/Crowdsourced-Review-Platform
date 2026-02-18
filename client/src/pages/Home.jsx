import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import './Home.css';

const Home = () => {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedBusinesses();
    fetchCategories();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    try {
      const response = await api.get('/businesses/featured');
      if (response.data.success) {
        setBusinesses(response.data.businesses);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/businesses/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (category) params.append('category', category);
    navigate(`/businesses?${params.toString()}`);
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

  return (
    <div className="home">

      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Local <span>Businesses</span>
          </h1>
          <p className="hero-subtitle">
            Share your experiences and help others find the best places in your community
          </p>
          
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for restaurants, shops, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="search-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-accent btn-lg">
              Search
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Businesses</span>
            </div>
            <div className="stat">
              <span className="stat-value">50K+</span>
              <span className="stat-label">Reviews</span>
            </div>
            <div className="stat">
              <span className="stat-value">100K+</span>
              <span className="stat-label">Users</span>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">
            Find exactly what you're looking for
          </p>
          
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/businesses?category=${cat.name}`}
                className="category-card"
              >
                <span className="category-icon">{getCategoryIcon(cat.name)}</span>
                <span className="category-name">{cat.label}</span>
                <span className="category-count">{cat.count} businesses</span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Businesses</h2>
              <p className="section-subtitle">
                Top-rated places recommended by our community
              </p>
            </div>
            <Link to="/businesses" className="btn btn-outline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : businesses.length > 0 ? (
            <div className="businesses-grid">
              {businesses.map((business) => (
                <Link
                  key={business._id}
                  to={`/businesses/${business._id}`}
                  className="business-card"
                >
                  <div className="business-image">
                    {business.images && business.images.length > 0 ? (
                      <img src={business.images[0]} alt={business.name} />
                    ) : (
                      <div className="business-image-placeholder">
                        <span>{getCategoryIcon(business.category)}</span>
                      </div>
                    )}
                    <span className="business-category-badge">
                      {getCategoryIcon(business.category)} {business.category}
                    </span>
                  </div>
                  <div className="business-info">
                    <h3 className="business-name">{business.name}</h3>
                    <p className="business-location">
                      📍 {business.city}, {business.state}
                    </p>
                    <div className="business-rating">
                      <StarRating rating={Math.round(business.averageRating)} size="sm" />
                      <span className="rating-value">
                        {business.averageRating.toFixed(1)}
                      </span>
                      <span className="review-count">
                        ({business.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No businesses found. Be the first to add one!</p>
              <Link to="/add-business" className="btn btn-primary mt-md">
                Add Business
              </Link>
            </div>
          )}
        </div>
      </section>


      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Share Your Experience?</h2>
            <p>
              Join thousands of users who are helping their community discover 
              the best local businesses. Your reviews make a difference.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-accent btn-lg">
                Get Started Free
              </Link>
              <Link to="/businesses" className="btn btn-outline btn-lg">
                Browse Businesses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

