import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  QrCode, 
  LogIn, 
  Menu, 
  X,
  Languages
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useLanguage } from '../context/LanguageContext';

export const GuestNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();

  const navLinks = [
    { label: t('submitRequest'), path: '/guest/request', icon: PlusCircle },
    { label: t('trackRequest'), path: '/guest/track', icon: Search },
    { label: t('qrGenerator'), path: '/guest/qr-generator', icon: QrCode },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Hotel Brand */}
          <Link to="/guest/request" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
              <img src={logoImg} alt="Hotel Arya Niwas Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg block leading-tight">
                {t('hotelName')}
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                {t('hotelSub')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Language Switcher (Sprint 3 US19 Hindi Support) */}
            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('langToggle')}</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('staffLogin')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('langToggle')}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <LogIn className="w-5 h-5" />
              {t('staffLogin')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
