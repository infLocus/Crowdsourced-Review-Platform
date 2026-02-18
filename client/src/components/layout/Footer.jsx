import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">📍</span>
              <span className="logo-text">InfLocus</span>
            </Link>
            <p className="footer-tagline">
              Discover and review the best local businesses in your area. 
              Share your experiences and help others make informed decisions.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">Facebook</a>
              <a href="#" className="social-link" aria-label="Twitter">Twitter</a>
              <a href="#" className="social-link" aria-label="Instagram">Instagram</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Explore</h4>
              <Link to="/businesses">All Businesses</Link>
              <Link to="/businesses?category=restaurant">Restaurants</Link>
              <Link to="/businesses?category=shop">Shops</Link>
              <Link to="/businesses?category=service">Services</Link>
            </div>

            <div className="footer-column">
              <h4>For Business</h4>
              <Link to="/add-business">Claim Your Business</Link>
              <a href="#">Business Login</a>
              <a href="#">Advertise</a>
              <a href="#">Resources</a>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
              <a href="#">Press</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Guidelines</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} InfLocus. All rights reserved.</p>
          <p className="footer-credit">Made with ❤️ for local communities</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

