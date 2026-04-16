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
  'w-full bg-transparent border-b border-ink/30 px-0 py-2 text-[15px] text-ink placeholder-ink-mute outline-none focus:border-cinnabar transition-colors';

const AUTH_LABEL_CLASS = 'block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mb-2';

export default function AuthPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Determine mode from URL path
  const initialMode: Mode = location.pathname === '/signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Sync mode with URL path
  useEffect(() => {
    const newMode: Mode = location.pathname === '/signup' ? 'signup' : 'login';
    setMode(newMode);
  }, [location.pathname]);

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
    <main className="min-h-screen flex items-center justify-center bg-cream px-5 py-24">
      <div className="w-full max-w-md">
        {/* Logo / Section label */}
        <div className="mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            {isLogin ? 'Sign In · 入場' : 'Sign Up · 登録'}
          </span>
          <h1 className="font-display text-5xl text-ink leading-none tracking-tight mt-3">
            {isLogin ? t('common.login') : t('common.signup')}
          </h1>
          <p className="mt-3 text-ink-soft">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? 'signup' : 'login')}
              className="text-cinnabar border-b border-cinnabar pb-0.5 hover:opacity-70 transition-opacity"
            >
              {isLogin ? t('common.signup') : t('common.login')}
            </button>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7 border-t border-ink pt-8">
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
            className="w-full bg-ink text-cream py-3.5 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && <SpinnerIcon className="h-4 w-4" />}
            {isLogin ? t('common.login') : t('common.signup')}
            <span className="opacity-60">→</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-ink/15" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            {t('auth.or')}
          </span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-ink py-3.5 text-[13px] text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {t('auth.googleContinue')}
        </button>
      </div>
    </main>
  );
}

