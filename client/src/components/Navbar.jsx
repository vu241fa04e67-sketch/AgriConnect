import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav('/');
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <Sprout /> AgriConnect
      </Link>
      <nav>
        <Link to="/">Marketplace</Link>
        {user && (
          <Link to="/dashboard" className="nav-link-flex">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
        )}
        {user ? (
          <div className="nav-user-cluster">
            <span className="user-badge" title={user.email}>
              <UserCheck size={14} />
              <b>{user.name}</b>
              <span className={`role-pill role-${user.role.toLowerCase()}`}>{user.role}</span>
            </span>
            <button className="nav-button nav-logout" onClick={handleLogout} title="Sign out">
              <LogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <div className="nav-auth-links">
            <Link className="nav-link-subtle" to="/register">Register</Link>
            <Link className="nav-cta" to="/login">Sign In</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
