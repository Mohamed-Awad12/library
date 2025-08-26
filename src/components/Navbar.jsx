import { NavLink } from 'react-router-dom';
import { Home, Book, PlusCircle, User, LogOut, BookOpen, History, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="brand">
            <div className="logo" />
            <h1>Library</h1>
          </div>

          <nav className="nav-links">
            <NavLink to="/dashboard" className="nav-link">
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/books" className="nav-link">
              <Book size={18} />
              <span>Browse Books</span>
            </NavLink>
            <NavLink to="/my-books" className="nav-link">
              <BookOpen size={18} />
              <span>My Books</span>
            </NavLink>
            <NavLink to="/publish" className="nav-link">
              <PlusCircle size={18} />
              <span>Publish</span>
            </NavLink>
            <NavLink to="/borrowing-history" className="nav-link">
              <History size={18} />
              <span>History</span>
            </NavLink>
            {user?.isAdmin && (
              <NavLink to="/admin" className="nav-link admin-link">
                <Shield size={18} />
                <span>Admin</span>
              </NavLink>
            )}
            <NavLink to="/profile" className="nav-link">
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </nav>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
            </div>
            <button onClick={logout} className="logout-btn" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
