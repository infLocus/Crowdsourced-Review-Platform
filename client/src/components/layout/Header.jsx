import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">📍</span>
          <span className="logo-text">InfLocus</span>
        </Link>

        <nav className="header-nav">
          <Link to="/businesses" className="nav-link">Discover</Link>
          {isAuthenticated && (
            <Link to="/add-business" className="nav-link">Add Business</Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/dashboard" className="user-button">
                <div className="user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{user?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="user-name">{user?.username}</span>
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="admin-link">
                  Admin Panel
                </Link>
              )}
              
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

