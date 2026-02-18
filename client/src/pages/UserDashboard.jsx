import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StarRating from '../components/common/StarRating';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  
  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      const response = await api.get('/reviews/user');
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', profileForm);
      if (response.data.success) {
        updateUser(response.data.user);
        setEditingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', label: 'Pending' },
      approved: { class: 'badge-success', label: 'Approved' },
      rejected: { class: 'badge-error', label: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Manage your profile and reviews</p>
        </div>

        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span>{user?.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3>{user?.username}</h3>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-role badge badge-secondary">{user?.role}</p>
              
              {!editingProfile ? (
                <button 
                  onClick={() => setEditingProfile(true)}
                  className="btn btn-outline btn-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={() => setEditingProfile(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              )}
            </div>

            {editingProfile && (
              <div className="profile-edit-card">
                <h4>Edit Profile</h4>
                <form onSubmit={handleProfileUpdate}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-textarea"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm btn-block">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            <div className="stats-card">
              <h4>Activity</h4>
              <div className="stat-item">
                <span className="stat-label">Total Reviews</span>
                <span className="stat-value">{reviews.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved</span>
                <span className="stat-value">
                  {reviews.filter(r => r.status === 'approved').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">
                  {reviews.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                My Reviews
              </button>
              <button
                className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookmarks')}
              >
                Bookmarks
              </button>
            </div>

            {activeTab === 'reviews' && (
              <div className="reviews-section">
                {loading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((review) => {
                      const badge = getStatusBadge(review.status);
                      return (
                        <div key={review._id} className="review-item">
                          <div className="review-business">
                            <Link to={`/businesses/${review.business?._id}`}>
                              <h4>{review.business?.name}</h4>
                            </Link>
                            <span className={`badge ${badge.class}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="review-rating">
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <h5 className="review-title">{review.title}</h5>
                          <p className="review-content">
                            {review.content.substring(0, 150)}...
                          </p>
                          <p className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          
                          {review.status === 'rejected' && review.rejectionReason && (
                            <div className="rejection-notice">
                              <strong>Reason:</strong> {review.rejectionReason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>No reviews yet</h3>
                    <p>Start reviewing businesses you've visited</p>
                    <Link to="/businesses" className="btn btn-primary mt-md">
                      Browse Businesses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="empty-state">
                <div className="empty-state-icon">🔖</div>
                <h3>No bookmarks yet</h3>
                <p>Save your favorite businesses for later</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

