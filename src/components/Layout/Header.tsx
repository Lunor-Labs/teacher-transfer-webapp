import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LogOut, Users, UserPlus, Search, Settings, MessageSquare, BarChart3, Menu, X, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Different navigation items for admin vs regular users
  const getNavigationItems = () => {
    if (userProfile?.isAdmin) {
      return [
        {
          path: '/admin',
          icon: Settings,
          label: t('adminDashboard'),
          color: 'text-red-600'
        },
        {
          path: '/testimonials',
          icon: MessageSquare,
          label: 'Testimonials',
          color: 'text-orange-600'
        }
      ];
    }

    return [
      {
        path: '/dashboard',
        icon: BarChart3,
        label: 'Dashboard',
        color: 'text-blue-600'
      },
      {
        path: '/matches',
        icon: Search,
        label: t('findMatches'),
        color: 'text-green-600'
      },
      {
        path: '/profile',
        icon: UserPlus,
        label: 'Profile',
        color: 'text-purple-600'
      },
      {
        path: '/testimonials',
        icon: MessageSquare,
        label: 'Testimonials',
        color: 'text-orange-600'
      }
    ];
  };

  const navigationItems = getNavigationItems();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getUserRole = () => {
    return userProfile?.isAdmin ? 'Admin' : 'Teacher';
  };

  const getUserSubtitle = () => {
    if (userProfile?.isAdmin) {
      return 'System Administrator';
    }
    return userProfile?.currentSchool ? `${userProfile.currentSchool}` : 'Teacher';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">{t('appName')}</span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">
                {t('appName')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? `bg-blue-50 ${item.color} shadow-sm`
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-gray-600" />
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
            </div>

            {/* User Info & Logout - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.fullName || userProfile?.email}
                  </p>
                  {userProfile?.isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {getUserSubtitle()}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* Navigation Items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? `bg-blue-50 ${item.color} border-l-4 border-blue-500`
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Language Selector - Mobile */}
            <div className="px-4 py-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Language</span>
              </label>
              <select
                value={currentLanguage.code}
                onChange={(e) => {
                  const lang = languages.find(l => l.code === e.target.value);
                  if (lang) setLanguage(lang);
                }}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* User Info - Mobile */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  userProfile?.isAdmin ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  <span className="text-white font-semibold text-sm">
                    {userProfile?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.fullName || userProfile?.email}
                    </p>
                    {userProfile?.isAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {getUserSubtitle()}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button - Mobile */}
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors mx-4"
            >
              <LogOut className="h-5 w-5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;