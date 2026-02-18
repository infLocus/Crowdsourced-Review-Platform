import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, reviewsRes, businessesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/reviews/pending'),
        api.get('/admin/businesses')
      ]);

      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.stats);
      }
      if (reviewsRes.data.success) {
        setPendingReviews(reviewsRes.data.reviews);
      }
      if (businessesRes.data.success) {
        setBusinesses(businessesRes.data.businesses);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    setProcessing(true);
    try {
      await api.put(`/admin/reviews/${reviewId}/approve`);
      setPendingReviews(prev => prev.filter(r => r._id !== reviewId));
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectReview = async (reviewId) => {
    setProcessing(true);
    try {
      await api.put(`/admin/reviews/${reviewId}/reject`, {
        reason: 'Does not meet our community guidelines'
      });
      setPendingReviews(prev => prev.filter(r => r._id !== reviewId));
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyBusiness = async (businessId, isVerified) => {
    try {
      await api.put(`/admin/businesses/${businessId}/verify`, { isVerified });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating business:', error);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;
    
    try {
      await api.delete(`/admin/businesses/${businessId}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage businesses, reviews, and users</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon primary">🏪</div>
            <div className="stat-card-value">{stats?.totalBusinesses || 0}</div>
            <div className="stat-card-label">Total Businesses</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon secondary">👥</div>
            <div className="stat-card-value">{stats?.totalUsers || 0}</div>
            <div className="stat-card-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon accent">⭐</div>
            <div className="stat-card-value">{stats?.totalReviews || 0}</div>
            <div className="stat-card-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon warning">⏳</div>
            <div className="stat-card-value">{stats?.pendingReviews || 0}</div>
            <div className="stat-card-label">Pending Reviews</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
          <button
            className={`tab ${activeTab === 'businesses' ? 'active' : ''}`}
            onClick={() => setActiveTab('businesses')}
          >
            Businesses
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-section">
            <div className="section-grid">
              <div className="section-card">
                <h3>Recent Reviews</h3>
                {stats?.recentReviews?.length > 0 ? (
                  <div className="recent-list">
                    {stats.recentReviews.map((review) => (
                      <div key={review._id} className="recent-item">
                        <div className="recent-info">
                          <span className="recent-title">{review.title}</span>
                          <span className="recent-meta">
                            for {review.business?.name}
                          </span>
                        </div>
                        <span className={`badge badge-${review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : 'warning'}`}>
                          {review.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No recent reviews</p>
                )}
              </div>

              <div className="section-card">
                <h3>Recent Businesses</h3>
                {stats?.recentBusinesses?.length > 0 ? (
                  <div className="recent-list">
                    {stats.recentBusinesses.map((business) => (
                      <div key={business._id} className="recent-item">
                        <div className="recent-info">
                          <span className="recent-title">{business.name}</span>
                          <span className="recent-meta">
                            {business.city}, {business.state}
                          </span>
                        </div>
                        <span className={`badge ${business.isVerified ? 'badge-success' : 'badge-warning'}`}>
                          {business.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No recent businesses</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="admin-section">
            {pendingReviews.length > 0 ? (
              <div className="reviews-pending-list">
                {pendingReviews.map((review) => (
                  <div key={review._id} className="pending-review-card">
                    <div className="pending-review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="reviewer-name">{review.user?.username}</span>
                          <span className="review-email">{review.user?.email}</span>
                        </div>
                      </div>
                      <div className="review-business-info">
                        <Link to={`/businesses/${review.business?._id}`}>
                          {review.business?.name}
                        </Link>
                        <span className="business-location">
                          {review.business?.city}, {review.business?.state}
                        </span>
                      </div>
                    </div>

                    <div className="pending-review-content">
                      <div className="review-rating-display">
                        <span className="rating-label">Rating:</span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="rating-value">{review.rating}/5</span>
                      </div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-text">{review.content}</p>
                    </div>

                    <div className="pending-review-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleRejectReview(review._id)}
                        disabled={processing}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApproveReview(review._id)}
                        disabled={processing}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h3>No pending reviews</h3>
                <p>All reviews have been processed</p>
              </div>
            )}
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="admin-section">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr key={business._id}>
                      <td>
                        <Link to={`/businesses/${business._id}`} className="business-link">
                          {business.name}
                        </Link>
                        <span className="business-location">
                          {business.city}, {business.state}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary">{business.category}</span>
                      </td>
                      <td>{business.owner?.username}</td>
                      <td>
                        <div className="rating-cell">
                          <StarRating rating={Math.round(business.averageRating)} size="sm" />
                          <span>{business.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="status-badges">
                          <span className={`badge ${business.isVerified ? 'badge-success' : 'badge-warning'}`}>
                            {business.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <span className={`badge ${business.isActive ? 'badge-success' : 'badge-error'}`}>
                            {business.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleVerifyBusiness(business._id, !business.isVerified)}
                          >
                            {business.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => handleDeleteBusiness(business._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

