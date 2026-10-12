import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Coffee, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Меню', path: '/menu' },
    { name: 'О нас', path: '/#about' },
    { name: 'Контакты', path: '/#contacts' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F2EA]/90 backdrop-blur-md border-b border-[#D8C6AE]/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-[#30251F] text-[#F6F2EA] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#30251F] uppercase block leading-none">
                ATELIER
              </span>
              <span className="text-[10px] tracking-[0.3em] text-[#7E7066] uppercase block mt-1">
                COFFEE ROASTERS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 text-sm tracking-widest uppercase">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors duration-200 relative py-1 ${
                  isActive(link.path)
                    ? 'text-[#30251F] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#30251F]'
                    : 'text-[#7E7066] hover:text-[#30251F]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions: Admin link + Cart button */}
          <div className="flex items-center space-x-5">
            <Link
              to="/admin"
              title="Панель администратора"
              className="hidden sm:flex items-center text-xs text-[#7E7066] hover:text-[#30251F] uppercase tracking-wider transition-colors px-2.5 py-1.5 rounded border border-[#D8C6AE]/40 hover:border-[#30251F]/40"
            >
              <Shield className="w-3.5 h-3.5 mr-1" />
              Админ
            </Link>

            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-[#30251F] text-[#F6F2EA] hover:bg-[#221A15] transition-transform duration-200 hover:scale-105 shadow-md flex items-center justify-center"
              aria-label="Корзина"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D8C6AE] text-[#30251F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F6F2EA] shadow-sm animate-pulse">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#30251F] focus:outline-none"
              aria-label="Переключить меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F6F2EA] border-b border-[#D8C6AE]/40 px-6 pt-4 pb-8 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-4 text-base tracking-widest uppercase">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-[#D8C6AE]/20 ${
                  isActive(link.path)
                    ? 'text-[#30251F] font-semibold'
                    : 'text-[#7E7066]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="pt-2 text-xs text-[#7E7066] flex items-center uppercase tracking-wider"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Управление / Админ-панель
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
