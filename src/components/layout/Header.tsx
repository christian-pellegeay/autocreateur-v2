import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
          <img 
            src="/Logo_autocreateur-removebg.png" 
            alt="Auto Créateur" 
            className="h-12 mr-2"
            onError={(e) => {
              // Fallback to a simple text logo if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.style.display = 'inline';
            }}
          />
          <span className="text-xl font-bold text-primary" style={{ display: 'none' }}>Auto Créateur</span>
          <span className="text-xl font-bold text-primary">Auto Créateur</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary'}`}>
            Accueil
          </Link>
          <Link to="/tools" className={`nav-link ${location.pathname.startsWith('/tools') ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary'}`}>
            Outils
          </Link>
          <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary'}`}>
            Tarifs
          </Link>
          <Link to="/faq" className={`nav-link ${location.pathname === '/faq' ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary'}`}>
            FAQ
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary'}`}>
            Contact
          </Link>
        </nav>

        {/* User Controls */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-gray-700">{user.tickets} tickets</span>
                <Link to="/buy-tickets" className="ml-2">
                  <ShoppingCart size={18} className="text-primary" />
                </Link>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-primary">
                  <User size={20} />
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                {/* Removed mt-2 to eliminate the gap between button and dropdown */}
                <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <div className="py-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profil
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin-login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Administration
                      </Link>
                    )}
                    <button 
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Link to="/login" className="btn btn-secondary">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary">
                Inscription
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 hover:text-primary" 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white shadow-md`}>
        <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
            Accueil
          </Link>
          <Link to="/tools" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
            Outils
          </Link>
          <Link to="/pricing" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
            Tarifs
          </Link>
          <Link to="/faq" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
            FAQ
          </Link>
          <Link to="/contact" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
            Contact
          </Link>
          
          {user ? (
            <>
              <div className="flex items-center py-2">
                <span className="text-sm font-medium text-gray-700 mr-2">{user.tickets} tickets</span>
                <Link to="/buy-tickets" className="text-primary" onClick={closeMobileMenu}>
                  <ShoppingCart size={18} />
                </Link>
              </div>
              <Link to="/profile" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
                Profil
              </Link>
              {user.isAdmin && (
                <Link to="/admin-login" className="py-2 text-gray-700 hover:text-primary" onClick={closeMobileMenu}>
                  Administration
                </Link>
              )}
              <button 
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="py-2 text-left text-gray-700 hover:text-primary flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 py-2">
              <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                Inscription
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;