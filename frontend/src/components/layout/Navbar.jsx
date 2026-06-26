import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import apiClient from '@/api/axios';
import {
  Home,
  Search,
  Mail,
  Upload,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  FileText,
  Shield,
  MessageSquare,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const desktopNavigation = [
    { name: 'Browse Papers', href: '/papers', icon: Search },
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'Requested Papers', href: '/requests', icon: FileText },
    { name: 'Leaderboard', href: '/leaderboard', icon: Shield },
    { name: 'Upload', href: '/upload', icon: Upload, requiresAuth: true },
  ];

  // Mobile drawer shows same nav as desktop for consistency
  const mobileDrawerNavigation = desktopNavigation;

  const mobileBottomNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Portfolio', href: '/papers', icon: Search },
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur shadow-sm border-b border-gray-200 fixed inset-x-0 top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 min-h-touch">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PaperShare</span>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {desktopNavigation.map((item) => {
                  if (item.requiresAuth && !user) return null;
                  if (isAdmin && item.href === '/upload') return null;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 min-h-touch-sm ${
                        isActive(item.href)
                          ? 'text-primary-700 bg-primary-50 border border-primary-200'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 md:gap-3">
              {user ? (
                <>
                  {/* Desktop user menu */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      to="/messages"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200 min-h-touch-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200 min-h-touch-sm"
                    >
                      {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      <span className="font-medium">{isAdmin ? 'Admin Panel' : user.username}</span>
                    </Link>
                  </div>

                  {/* Mobile avatar trigger */}
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="md:hidden min-h-touch min-w-touch flex items-center justify-center"
                    aria-label="Open profile"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={`${apiClient.defaults.baseURL.replace('/api', '')}/${user.profilePicture.replace(/\\/g, '/')}`}
                        alt="Profile avatar"
                        className="h-9 w-9 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 border border-primary-200">
                      <User className="h-4 w-4" />
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Desktop unauthenticated buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="btn-secondary">
                      Sign In
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Sign Up
                    </Link>
                  </div>

                  {/* Mobile primary auth action */}
                  <Link to="/login" className="md:hidden btn-primary px-4 py-2 text-sm">
                    Sign In
                  </Link>
                </>
              )}

              {/* Mobile menu icon */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden min-h-touch min-w-touch flex items-center justify-center rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile slide-in drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[84%] max-w-sm bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-label="Mobile navigation drawer"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 safe-top">
            <span className="text-sm font-semibold text-gray-900">Navigation</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-[calc(100%-64px)] overflow-y-auto px-4 py-4">
            {!user ? (
              <div className="mb-5 rounded-xl border border-gray-200 p-3 bg-gray-50">
                <Link to="/login" className="btn-primary w-full justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-secondary w-full justify-center mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="mb-5 rounded-xl border border-gray-200 p-3 bg-gray-50">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-3 min-h-touch"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                    {user?.profilePicture ? (
                      <img
                        src={`${apiClient.defaults.baseURL.replace('/api', '')}/${user.profilePicture.replace(/\\/g, '/')}`}
                        alt="Profile avatar"
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 border border-primary-200 hidden">
                      <User className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{isAdmin ? 'Admin Account' : user?.username}</p>
                      <p className="text-xs text-gray-500">{isAdmin ? 'Open admin panel' : 'Open dashboard'}</p>
                    </div>
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {mobileDrawerNavigation.map((item) => {
                if (item.requiresAuth && !user) return null;
                if (isAdmin && item.href === '/upload') return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 min-h-touch ${
                      isActive(item.href)
                        ? 'text-primary-700 bg-primary-50 border border-primary-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {user && (
                <>
                  <Link
                    to="/messages"
                    className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 min-h-touch"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="mr-3 h-5 w-5" />
                    Messages
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-error-600 min-h-touch"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom navigation for mobile */}
      <nav className="hidden md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-bottom">
        <div className="grid grid-cols-4 h-16 px-2">
          {mobileBottomNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center text-[11px] font-medium transition-colors duration-200 min-h-touch ${
                  active ? 'text-primary-700' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;