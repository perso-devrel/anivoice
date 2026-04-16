import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { XIcon, MenuIcon } from '../icons';

const NAV_LINK_KEYS = [
  { to: '/dashboard', labelKey: 'common.dashboard', authOnly: true },
  { to: '/studio', labelKey: 'common.studio', authOnly: true },
  { to: '/library', labelKey: 'common.library', authOnly: false },
  { to: '/pricing', labelKey: 'common.pricing', authOnly: false },
] as const;

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

  const navLinks = NAV_LINK_KEYS.filter((link) => !link.authOnly || user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-[2px] border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="font-display text-[1.6rem] leading-none tracking-tight text-ink italic">
              Ani
            </span>
            <span className="font-display text-[1.6rem] leading-none tracking-tight text-ink">
              Voice
            </span>
            <span className="hidden sm:inline font-jp text-xs text-ink-mute ml-1 translate-y-[-2px]">
              声
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-[13px] tracking-wide uppercase font-mono transition-colors ${
                    active ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t(link.labelKey)}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-cinnabar" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={toggleLang}
              className="text-[12px] tracking-widest font-mono text-ink-soft hover:text-ink transition-colors"
            >
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
            {user ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
              >
                <div className="w-8 h-8 border border-ink/30 flex items-center justify-center font-display text-sm text-ink">
                  {user.displayName[0]}
                </div>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-mono uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="text-[13px] font-mono uppercase tracking-wide px-4 py-2 bg-ink text-cream hover:bg-cinnabar transition-colors"
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-ink"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
          >
            {mobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-ink/10 py-5 space-y-1" aria-label={t('common.menu')}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2.5 text-sm text-ink hover:bg-paper transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="flex items-center gap-4 px-2 pt-3 border-t border-ink/10 mt-2">
              <button onClick={toggleLang} className="text-[12px] font-mono uppercase tracking-widest text-ink-soft">
                {language === 'ko' ? 'English' : '한국어'}
              </button>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[12px] font-mono uppercase tracking-widest text-cinnabar"
                >
                  {t('common.login')}
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </nav>
  );
}
