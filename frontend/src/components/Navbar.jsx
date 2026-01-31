import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Used to highlight the active link
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Helper function to define link styles
  const linkClass = (path) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
    ${location.pathname === path 
      ? 'bg-blue-700 text-white shadow-sm' 
      : 'text-blue-100 hover:bg-blue-500 hover:text-white'}
  `;

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-extrabold tracking-tight group-hover:text-blue-200 transition-colors">
              Lost <span className="text-blue-200">&</span> Found
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/lost" className={linkClass('/lost')}>Lost Items</Link>
            <Link to="/found" className={linkClass('/found')}>Found Items</Link>

            {isAuthenticated ? (
              <>
                <div className="h-6 w-px bg-blue-500 mx-2" /> {/* Divider */}
                <Link to="/my-posts" className={linkClass('/my-posts')}>My Posts</Link>
                <Link to="/create-lost" className={linkClass('/create-lost')}>Post Lost</Link>
                <Link to="/create-found" className={linkClass('/create-found')}>Post Found</Link>
                <Link to="/claims" className={linkClass('/claims')}>Claims</Link>
                <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
                
                <div className="ml-4 flex items-center gap-4">
                  <NotificationBadge />
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="bg-amber-400 hover:bg-amber-500 text-blue-900 px-3 py-1.5 rounded-md text-sm font-bold transition-all">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-white/10 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold border border-white/20 transition-all hover:border-transparent"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                <Link to="/register" className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-blue-500 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-3 space-y-1">
            <Link to="/lost" className="block px-3 py-2 rounded-md hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Lost Items</Link>
            <Link to="/found" className="block px-3 py-2 rounded-md hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Found Items</Link>
            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-blue-600" />
                <Link to="/my-posts" className="block px-3 py-2 rounded-md hover:bg-blue-600" onClick={() => setMenuOpen(false)}>My Posts</Link>
                <Link to="/create-lost" className="block px-3 py-2 rounded-md hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Post Lost</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Profile Settings</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-200 font-bold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;