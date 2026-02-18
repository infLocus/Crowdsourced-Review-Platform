import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import './Businesses.css';

const Businesses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    sort: searchParams.get('sort') || 'rating'
  });

  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchBusinesses();
    fetchCategories();
  }, [searchParams]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await api.get(`/businesses?${params.toString()}`);
      if (response.data.success) {
        setBusinesses(response.data.businesses);
        setPagination(response.data.pagination);
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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      state: '',
      sort: 'rating'
    });
    setSearchParams({});
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

  const hasActiveFilters = filters.search || filters.category || filters.city || filters.state;

  return (
    <div className="businesses-page">
      <div className="container">
        <div className="page-header">
          <h1>Discover Businesses</h1>
          <p>Find and review the best local businesses in your area</p>
        </div>

        <div className="businesses-layout">

          <aside className="filters-sidebar">
            <div className="filters-card">
              <div className="filters-header">
                <h3>Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="clear-filters">
                    Clear All
                  </button>
                )}
              </div>

              <div className="filter-group">
                <label className="filter-label">Search</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Business name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {getCategoryIcon(cat.name)} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter state..."
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  className="form-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </aside>


          <main className="businesses-main">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : businesses.length > 0 ? (
              <>
                <div className="results-info">
                  <span>
                    Showing {businesses.length} of {pagination?.total} businesses
                  </span>
                </div>

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
                        <p className="business-description">
                          {business.description?.substring(0, 100)}...
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


                {pagination && pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      ←
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                      .map((p, index, arr) => (
                        <span key={p}>
                          {index > 0 && arr[index - 1] !== p - 1 && <span className="pagination-dots">...</span>}
                          <button
                            className={`pagination-btn ${p === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No businesses found</h3>
                <p>Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn btn-primary mt-md">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Businesses;

