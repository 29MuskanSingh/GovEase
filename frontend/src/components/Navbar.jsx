import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">GovEase AI(Sample Prototype)</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span className="user-name">Hello, {user?.fullName}</span>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/exams" className="nav-link">Exams</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
