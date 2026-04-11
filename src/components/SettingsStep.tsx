import { useTranslation } from 'react-i18next';
import { FileIcon, CheckIcon } from './icons';
import { LANGUAGE_KEYS } from '../constants';

const STUDIO_LANGUAGES = ['auto', ...LANGUAGE_KEYS] as const;

interface SettingsStepProps {
  selectedFile: File | null;
  sourceLanguage: string;
  targetLanguages: string[];
  withLipSync: boolean;
  onFileReset: () => void;
  onSourceLanguageChange: (lang: string) => void;
  onTargetLanguageToggle: (lang: string) => void;
  onWithLipSyncToggle: () => void;
  onStartDubbing: () => void;
}

export function SettingsStep({
  selectedFile,
  sourceLanguage,
  targetLanguages,
  withLipSync,
  onFileReset,
  onSourceLanguageChange,
  onTargetLanguageToggle,
  onWithLipSyncToggle,
  onStartDubbing,
}: SettingsStepProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold gradient-text mb-2">{t('studio.selectLanguage')}</h2>
      </div>

      {selectedFile && (
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-surface-200/80">
          <FileIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={onFileReset}
            className="ml-auto text-xs text-surface-200/40 hover:text-red-400 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      <div className="glass rounded-2xl p-5 space-y-3">
        <label className="block text-sm font-medium text-surface-200/80">
          {t('studio.sourceLanguage')}
        </label>
        <select
          value={sourceLanguage}
          onChange={(e) => onSourceLanguageChange(e.target.value)}
          aria-label={t('studio.sourceLanguage')}
          className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
        >
          {STUDIO_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang === 'auto' ? t('studio.autoDetect') : t(`languages.${lang}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-surface-200/80">
            {t('studio.targetLanguage')}
            <span className="ml-1 text-red-400" aria-hidden="true">*</span>
          </label>
          {targetLanguages.length === 0 ? (
            <span className="text-xs text-yellow-400/90">{t('studio.selectTargetLanguage')}</span>
          ) : (
            <span className="text-xs text-primary-400">{t('studio.languagesSelected', { count: targetLanguages.length })}</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STUDIO_LANGUAGES.filter((l) => l !== 'auto' && l !== sourceLanguage).map((lang) => {
            const checked = targetLanguages.includes(lang);
            return (
              <label
                key={lang}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg cursor-pointer border transition-all text-sm ${
                  checked
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-surface-700 bg-surface-900/50 text-surface-200/60 hover:border-surface-200/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTargetLanguageToggle(lang)}
                  className="hidden"
                />
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'border-primary-500 bg-primary-500' : 'border-surface-700'}`}>
                  {checked && <CheckIcon className="w-3 h-3 text-white" />}
                </span>
                {t(`languages.${lang}`)}
              </label>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={onWithLipSyncToggle}
            className={`w-11 h-6 rounded-full transition-colors relative ${withLipSync ? 'bg-primary-500' : 'bg-surface-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${withLipSync ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
          </button>
          <div>
            <span className="text-sm font-medium text-surface-200/80">{t('studio.progressLipSync')}</span>
            <p className="text-xs text-surface-200/40 mt-0.5">{t('studio.lipSyncProRequired')}</p>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={onStartDubbing}
        disabled={targetLanguages.length === 0}
        aria-disabled={targetLanguages.length === 0}
        title={targetLanguages.length === 0 ? t('studio.selectTargetLanguage') : undefined}
        className="w-full gradient-bg py-3 rounded-xl text-white font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {targetLanguages.length > 0 ? t('studio.startDubbing') : t('studio.selectTargetLanguage')}
      </button>
    </div>
  );
}
