import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile as updateUserProfile } from '../services/firebase';
import { UserIcon } from './icons';

const PROFILE_SAVE_DISPLAY_MS = 2000;

interface ProfileTabProps {
  email: string;
  initialDisplayName: string;
}

export function ProfileTab({ email, initialDisplayName }: ProfileTabProps) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), PROFILE_SAVE_DISPLAY_MS);
    } catch {
      // Profile update failed silently — user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-ink pt-6 space-y-8">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Identity · 名乗
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
          {t('settings.profile')}
        </h2>
      </div>

      <div className="flex items-center gap-5 border-t border-ink/15 pt-6">
        <div className="w-16 h-16 border border-ink/30 bg-paper-deep flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-ink-mute" />
        </div>
        <div>
          <p className="text-[14px] text-ink">
            {t('settings.avatarPlaceholder')}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mt-1">
            {t('settings.avatarHint')}
          </p>
        </div>
      </div>

      <div className="border-t border-ink/15 pt-5">
        <label className="block font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-3">
          {t('settings.displayName')}
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-transparent border-b border-ink/30 px-0 py-2 text-ink focus:outline-none focus:border-cinnabar transition-colors text-[15px]"
        />
      </div>

      <div className="border-t border-ink/15 pt-5">
        <label className="block font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-3">
          {t('settings.email')}
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full bg-transparent border-b border-ink/15 px-0 py-2 text-ink-mute cursor-not-allowed text-[15px]"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute mt-2">
          {t('settings.emailReadonly')}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-ink text-cream font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors disabled:opacity-40"
      >
        {saved ? t('settings.saved') : saving ? t('common.loading') : t('settings.save')}
      </button>
    </div>
  );
}
