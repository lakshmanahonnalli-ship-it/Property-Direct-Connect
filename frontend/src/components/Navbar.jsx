import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import {
  Home,
  Building2,
  Key,
  PlusCircle,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOwner } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/dashboard/admin';
    if (user?.role === 'owner') return '/dashboard/owner';
    return '/dashboard/buyer';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Property<span className="text-blue-400">Connect</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                Direct Real Estate Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/buy"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/buy') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Buy Property
            </Link>
            <Link
              to="/rent"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/rent') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Rent Property
            </Link>
            <Link
              to="/commercial"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/commercial') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Commercial
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className="relative p-2.5 text-slate-300 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Saved Properties"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Post a Property Button */}
            <Link
              to="/post-property"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Property</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ml-1">
                Free
              </span>
            </Link>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700/80 px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-500/40">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[110px] truncate text-slate-200">{user?.name}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isAdmin
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                        : user?.role === 'owner'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isAdmin ? 'Admin' : user?.role === 'owner' ? 'Owner' : 'Buyer'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-sm backdrop-blur-md"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-semibold text-slate-200 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/dashboard/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-purple-300 hover:bg-purple-950/40 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Saved Properties</span>
                    </Link>

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-slate-200 hover:text-white px-3.5 py-2 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-sm font-semibold rounded-xl border border-slate-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden space-x-3">
            <Link to="/favorites" className="relative p-2 text-slate-300">
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-slate-800"
            >
              Buy Property
            </Link>
            <Link
              to="/rent"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-slate-800"
            >
              Rent Property
            </Link>
            <Link
              to="/commercial"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-slate-800"
            >
              Commercial Properties
            </Link>
            <Link
              to="/post-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-blue-400 font-semibold hover:bg-slate-800"
            >
              + Post a Property (Free)
            </Link>
          </div>

          <div className="border-t border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-slate-400">
                  Signed in as <span className="text-white font-medium">{user?.name}</span> ({user?.role})
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-slate-800 text-white font-medium"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-400 font-medium hover:bg-rose-950/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white border border-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
