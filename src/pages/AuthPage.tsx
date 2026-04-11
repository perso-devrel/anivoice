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
    <main className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="gradient-text text-2xl font-bold">AniVoice</span>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-surface-700">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              isLogin
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('common.login')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              !isLogin
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('common.signup')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">{t('auth.name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-lg bg-surface-900 border border-surface-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
                placeholder={t('auth.namePlaceholder')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-surface-900 border border-surface-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg bg-surface-900 border border-surface-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-bg rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <SpinnerIcon className="h-4 w-4" />}
            {isLogin ? t('common.login') : t('common.signup')}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-surface-700" />
          <span className="text-xs text-gray-500">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-surface-700" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-white py-2.5 text-sm font-medium text-gray-700 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <GoogleIcon />
          {t('auth.googleContinue')}
        </button>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            {isLogin ? t('common.signup') : t('common.login')}
          </button>
        </p>
      </div>
    </main>
  );
}

