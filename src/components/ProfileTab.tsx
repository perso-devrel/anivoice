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
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-surface-700 flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-gray-500" />
        </div>
        <div>
          <p className="text-white font-medium">
            {t('settings.avatarPlaceholder')}
          </p>
          <p className="text-sm text-gray-500">
            {t('settings.avatarHint')}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('settings.displayName')}
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('settings.email')}
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-4 py-3 rounded-xl bg-surface-850 border border-surface-700 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('settings.emailReadonly')}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saved ? t('settings.saved') : saving ? t('common.loading') : t('settings.save')}
      </button>
    </div>
  );
}
