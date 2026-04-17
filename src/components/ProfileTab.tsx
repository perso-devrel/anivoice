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
    <div className="relative bg-ink border-2 border-bone/30 p-6 space-y-6 corner-marks">
      <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2">IDENTITY</span>

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 bg-void border-2 border-lucy/30 flex items-center justify-center hover:border-lucy transition-colors overflow-hidden">
          <UserIcon className="w-10 h-10 text-bone/50" />
          <div className="absolute inset-0 scanlines pointer-events-none" />
        </div>
        <div>
          <p className="text-bone font-medium">
            {t('settings.avatarPlaceholder')}
          </p>
          <p className="text-sm text-bone/50">
            {t('settings.avatarHint')}
          </p>
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-bone/60 mb-2">
          {t('settings.displayName')}
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full py-2 bg-transparent border-0 border-b-2 border-bone/30 text-bone placeholder-bone/40 focus:outline-none focus:border-lucy transition-colors"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-bone/60 mb-2">
          {t('settings.email')}
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full py-2 bg-transparent border-0 border-b-2 border-bone/20 text-bone/40 cursor-not-allowed"
        />
        <p className="text-xs text-bone/50 mt-1">
          {t('settings.emailReadonly')}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-david text-void border-2 border-david font-mono uppercase tracking-widest hover:bg-void hover:text-david transition-colors disabled:opacity-50 flicker-on-hover"
      >
        {saved ? t('settings.saved') : saving ? t('common.loading') : t('settings.save')}
      </button>
    </div>
  );
}
