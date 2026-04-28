import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../stores/toastStore';
import { mapAuthError } from '../utils/auth';
import { GoogleIcon, SpinnerIcon } from '../components/icons';
import type { User } from '../types';

type Mode = 'login' | 'signup';

const AUTH_INPUT_CLASS =
  'w-full bg-ink border-2 border-bone/30 px-4 py-2.5 text-sm text-bone placeholder-bone/40 outline-none focus:border-lucy transition-colors font-body';

const AUTH_LABEL_CLASS = 'block text-xs font-mono uppercase tracking-widest text-bone/60 mb-1.5';

export default function AuthPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const mode: Mode = location.pathname === '/signup' ? 'signup' : 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSuccess = (u: User) => {
    useAuthStore.getState().setUser(u);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u =
        mode === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password, displayName);
      handleSuccess(u);
    } catch (err: unknown) {
      showToast(mapAuthError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const u = await signInWithGoogle();
      handleSuccess(u);
    } catch (err: unknown) {
      showToast(mapAuthError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    navigate(newMode === 'login' ? '/login' : '/signup', { replace: true });
  };

  const isLogin = mode === 'login';

  return (
    <main className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-md bg-ink border-2 border-bone/30 p-8 corner-marks">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 relative">
          <span className="absolute -top-4 -right-4 font-jp text-5xl text-bone/[0.05] select-none pointer-events-none" aria-hidden="true">認証</span>
          <div className="w-10 h-10 bg-lucy text-void flex items-center justify-center font-display font-black text-xl">
            K
          </div>
          <span className="text-2xl font-display font-bold text-bone">KoeDub</span>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b-2 border-bone/20">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 pb-3 font-mono text-xs uppercase tracking-widest transition-colors ${
              isLogin
                ? 'text-lucy border-b-2 border-lucy'
                : 'text-bone/50 hover:text-bone/80'
            }`}
          >
            {t('common.login')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 pb-3 font-mono text-xs uppercase tracking-widest transition-colors ${
              !isLogin
                ? 'text-lucy border-b-2 border-lucy'
                : 'text-bone/50 hover:text-bone/80'
            }`}
          >
            {t('common.signup')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={AUTH_LABEL_CLASS}>{t('auth.name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={AUTH_INPUT_CLASS}
                placeholder={t('auth.namePlaceholder')}
              />
            </div>
          )}

          <div>
            <label className={AUTH_LABEL_CLASS}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={AUTH_INPUT_CLASS}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className={AUTH_LABEL_CLASS}>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={AUTH_INPUT_CLASS}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lucy text-void py-2.5 font-display font-bold uppercase tracking-widest text-sm transition-colors hover:bg-void hover:text-lucy border-2 border-lucy disabled:opacity-50 flex items-center justify-center gap-2 flicker-on-hover offset-lucy-sm hover:shadow-none"
          >
            {loading && <SpinnerIcon className="h-4 w-4" />}
            {isLogin ? t('common.login') : t('common.signup')}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-bone/20" />
          <span className="text-xs font-mono uppercase tracking-widest text-bone/40">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-bone/20" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-bone py-2.5 text-sm font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-50 offset-void-sm hover:shadow-none"
        >
          <GoogleIcon />
          {t('auth.googleContinue')}
        </button>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-bone/50">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
            className="text-lucy hover:text-david font-medium"
          >
            {isLogin ? t('common.signup') : t('common.login')}
          </button>
        </p>
      </div>
    </main>
  );
}
