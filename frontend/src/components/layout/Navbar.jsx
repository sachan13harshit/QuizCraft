import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaPlus, 
  FaList, 
  FaTrophy,
  FaBrain 
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-white rounded-lg p-2 shadow-md group-hover:scale-110 transition-transform duration-200">
              <FaBrain className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-white text-xl font-bold tracking-wide">
              QuizCraft
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <FaList className="mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              {user?.role === 'creator' && (
                <Link to="/create-quiz">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <FaPlus className="mr-2" />
                    Create Quiz
                  </Button>
                </Link>
              )}
              

            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                  <FaUser className="text-white" />
                  <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
                  <span className="text-white/70 text-sm">({user?.role})</span>
                </div>
                
                {/* Logout Button */}
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="ghost"
                    className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 border-0 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    variant="secondary"
                    className="bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 text-white hover:from-yellow-500 hover:via-pink-600 hover:to-red-600 border-0 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden pb-4">
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <FaList className="mr-1" />
                  Dashboard
                </Button>
              </Link>
              
              {user?.role === 'creator' && (
                <Link to="/create-quiz">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <FaPlus className="mr-1" />
                    Create
                  </Button>
                </Link>
              )}
              

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 