import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
      <div className="navbar-container">
        <div className="sidebar">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active-link' : ''}>
            Dashboard
          </Link>
          <Link to="/logs" className={location.pathname === '/logs' ? 'active-link' : ''}>
            Logs
          </Link>
          <Link to="/profile" className={location.pathname === '/profile' ? 'active-link' : ''}>
            Profile
          </Link>
        </div>
      </div>

  );
}

export default Navbar;
