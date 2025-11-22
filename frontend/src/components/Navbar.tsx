import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Heart, Search, User, LogOut } from 'lucide-react';
import { useUser } from '../context/user/useUser';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/90 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Film className="w-7 h-7 text-white" />
            </div>
            <span className="hidden sm:inline text-xl font-bold">Film-Match</span>
          </button>

          <div className="flex items-center space-x-6">
            <Link
              to="/matches"
              className="flex items-center space-x-2 hover:text-primary-pink transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Matches</span>
            </Link>
            <Link
              to="/search"
              className="flex items-center space-x-2 hover:text-primary-pink transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Buscar</span>
            </Link>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-gray-700"></div>

            {/* Profile Button */}
            <Link
              to="/profile"
              className="flex items-center space-x-2 hover:text-primary-pink transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Perfil</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
