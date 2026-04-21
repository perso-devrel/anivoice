import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { XIcon, MenuIcon, ChevronDownIcon } from '../icons';

const NAV_LINK_KEYS = [
  { to: '/dashboard', labelKey: 'common.dashboard', authOnly: true },
  { to: '/studio', labelKey: 'common.studio', authOnly: true },
  { to: '/archive', labelKey: 'common.library', authOnly: false },
  { to: '/pricing', labelKey: 'common.pricing', authOnly: false },
] as const;

const LANG_OPTIONS: { code: 'ko' | 'en' | 'ja' | 'zh'; label: string; short: string }[] = [
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'zh', label: '中文', short: 'ZH' },
];

function LangDropdown({ language, onChange }: { language: string; onChange: (lang: 'ko' | 'en' | 'ja' | 'zh') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = LANG_OPTIONS.find((o) => o.code === language) ?? LANG_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-bone/60 hover:text-bone px-3 py-1.5 border border-bone/30 hover:border-bone transition-colors"
      >
        {current.short}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-void border-2 border-bone/30 z-50">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { onChange(opt.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-xs transition-colors ${
                language === opt.code
                  ? 'text-lucy border-l-2 border-lucy bg-ink'
                  : 'text-bone/60 hover:text-bone hover:bg-ink border-l-2 border-transparent'
              }`}
            >
              <span className="uppercase tracking-wider">{opt.short}</span>
              <span className="text-bone/40">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const handleLangChange = (lang: 'ko' | 'en' | 'ja' | 'zh') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const navLinks = NAV_LINK_KEYS.filter((link) => !link.authOnly || user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void/95 backdrop-blur-sm border-b-2 border-bone">
      <div className="px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 overflow-hidden">
              <div className="absolute inset-0 bg-lucy" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              <div className="absolute inset-0 bg-david" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
              <span className="absolute inset-0 flex items-center justify-center font-display font-black text-sm text-void group-hover:[text-shadow:-1px_0_var(--color-wire),1px_0_var(--color-rebecca)] transition-all">
                A
              </span>
            </div>
            <span className="font-display font-bold text-lg text-bone group-hover:text-lucy transition-colors">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-mono text-xs uppercase tracking-[0.15em] px-4 py-2 transition-colors ${
                  location.pathname === link.to
                    ? 'text-lucy'
                    : 'text-bone/60 hover:text-bone'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <LangDropdown language={language} onChange={handleLangChange} />
            {user ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 text-sm text-bone/80 hover:text-bone"
              >
                <div className="w-8 h-8 bg-ink border border-bone/40 flex items-center justify-center font-display font-bold text-xs text-bone">
                  {user.displayName[0]}
                </div>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-mono text-xs uppercase tracking-widest text-bone/60 hover:text-bone transition-colors px-3 py-1.5"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="font-display font-bold text-xs uppercase tracking-widest bg-david text-void px-5 py-2 border-2 border-david hover:bg-void hover:text-david transition-colors"
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-bone/70 hover:text-bone"
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
          <nav className="md:hidden border-t-2 border-bone py-4 space-y-1" aria-label={t('common.menu')}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                  location.pathname === link.to
                    ? 'text-lucy bg-ink'
                    : 'text-bone/70 hover:text-bone hover:bg-ink'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {/* Mobile language selector */}
            <div className="px-4 pt-4 border-t-2 border-bone/30 mt-2 space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/30 mb-2">LANGUAGE</p>
              <div className="grid grid-cols-2 gap-2">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => { handleLangChange(opt.code); setMobileMenuOpen(false); }}
                    className={`px-3 py-2 font-mono text-xs transition-colors border-2 ${
                      language === opt.code
                        ? 'border-lucy text-lucy bg-lucy/10'
                        : 'border-bone/20 text-bone/50 hover:text-bone hover:border-bone/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {!user && (
              <div className="px-4 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-widest text-lucy"
                >
                  {t('common.login')}
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </nav>
  );
}
