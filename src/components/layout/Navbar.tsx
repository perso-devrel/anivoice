import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const { language, setLanguage } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const toggleLang = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: t('common.dashboard') },
        { to: '/studio', label: t('common.studio') },
        { to: '/library', label: t('common.library') },
        { to: '/pricing', label: t('common.pricing') },
      ]
    : [
        { to: '/library', label: t('common.library') },
        { to: '/pricing', label: t('common.pricing') },
      ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-xl font-bold gradient-text">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
            {user ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center">
                  {user.displayName[0]}
                </div>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="text-sm px-4 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-700 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-800 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 pt-2 border-t border-surface-700 mt-2">
              <button onClick={toggleLang} className="text-sm text-gray-400">
                {language === 'ko' ? 'English' : '한국어'}
              </button>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-primary-400"
                >
                  {t('common.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
