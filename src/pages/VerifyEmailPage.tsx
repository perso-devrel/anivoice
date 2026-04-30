import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../stores/toastStore';
import { resendEmailVerification, reloadEmailVerified, signOut } from '../services/firebase';
import { mapAuthError } from '../utils/auth';
import { SpinnerIcon } from '../components/icons';

const RESEND_COOLDOWN_MS = 60_000;

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.auth');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const cooldownLeft = Math.max(0, cooldownUntil - Date.now());
  const canResend = cooldownLeft === 0 && !resending;

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await resendEmailVerification();
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      showToast(t('auth.verifyResent'), 'success');
    } catch (err) {
      showToast(mapAuthError(err, t));
    } finally {
      setResending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const verified = await reloadEmailVerified();
      if (verified) {
        showToast(t('auth.verifyDone'), 'success');
        navigate('/dashboard', { replace: true });
      } else {
        showToast(t('auth.verifyNotYet'), 'info');
      }
    } catch (err) {
      showToast(mapAuthError(err, t));
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-md bg-ink border-2 border-bone/30 p-8 corner-marks">
        <div className="flex items-center justify-center gap-3 mb-6 relative">
          <span className="absolute -top-4 -right-4 font-jp text-5xl text-bone/[0.05] select-none pointer-events-none" aria-hidden="true">確認</span>
          <div className="w-10 h-10 bg-lucy text-void flex items-center justify-center font-display font-black text-xl">K</div>
          <span className="text-2xl font-display font-bold text-bone">KoeDub</span>
        </div>

        <h1 className="text-xl font-display font-bold text-bone mb-3 text-center">
          {t('auth.verifyTitle')}
        </h1>
        <p className="text-sm text-bone/70 text-center mb-2 leading-relaxed">
          {t('auth.verifyDesc', { email: user?.email ?? '' })}
        </p>
        <p className="text-xs text-bone/40 text-center mb-6">
          {t('auth.verifySpamHint')}
        </p>

        <button
          type="button"
          onClick={handleCheck}
          disabled={checking}
          className="w-full bg-lucy text-void py-2.5 font-display font-bold uppercase tracking-widest text-sm transition-colors hover:bg-void hover:text-lucy border-2 border-lucy disabled:opacity-50 flex items-center justify-center gap-2 flicker-on-hover offset-lucy-sm hover:shadow-none mb-3"
        >
          {checking && <SpinnerIcon className="h-4 w-4" />}
          {t('auth.verifyCheck')}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="w-full border-2 border-bone/30 text-bone py-2.5 text-sm font-mono uppercase tracking-widest transition-colors hover:border-bone/60 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {resending && <SpinnerIcon className="h-4 w-4" />}
          {cooldownLeft > 0
            ? `${t('auth.verifyResend')} (${Math.ceil(cooldownLeft / 1000)}s)`
            : t('auth.verifyResend')}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 w-full text-center text-xs text-bone/50 hover:text-bone/80 transition-colors"
        >
          {t('auth.verifySignOut')}
        </button>
      </div>
    </main>
  );
}
