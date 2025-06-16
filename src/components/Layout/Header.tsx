import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LogOut, Users, UserPlus, Search, Settings, MessageSquare, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/matches"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/matches')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>{t('findMatches')}</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Profile</span>
            </Link>

            <Link
              to="/testimonials"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/testimonials')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Testimonials</span>
            </Link>

            {userProfile?.isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>{t('adminDashboard')}</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={currentLanguage.code}
                onChange={(e) => {
                  const lang = languages.find(l => l.code === e.target.value);
                  if (lang) setLanguage(lang);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {userProfile?.fullName || userProfile?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/matches"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/matches')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Search className="h-5 w-5" />
            <span>{t('findMatches')}</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/profile')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="h-5 w-5" />
            <span>Profile</span>
          </Link>

          <Link
            to="/testimonials"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/testimonials')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Testimonials</span>
          </Link>

          {userProfile?.isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>{t('adminDashboard')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;