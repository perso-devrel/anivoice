import { useTranslation } from 'react-i18next';
import { FileIcon, CheckIcon } from './icons';
import { LANGUAGE_KEYS } from '../constants';

const STUDIO_LANGUAGES = ['auto', ...LANGUAGE_KEYS] as const;

function SettingsBlock({ label, sub, children }: { label: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink/15 pt-5">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          {label}
        </span>
        {sub}
      </div>
      {children}
    </div>
  );
}

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
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="border-t border-ink pt-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Cast · 配役
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
          {t('studio.selectLanguage')}
        </h2>
      </div>

      {selectedFile && (
        <div className="border border-ink/20 px-5 py-4 flex items-center gap-4">
          <FileIcon className="w-5 h-5 shrink-0 text-ink-soft" />
          <span className="truncate font-mono text-[13px] text-ink">{selectedFile.name}</span>
          <button
            type="button"
            onClick={onFileReset}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute hover:text-cinnabar transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      <SettingsBlock label={t('studio.sourceLanguage')}>
        <select
          value={sourceLanguage}
          onChange={(e) => onSourceLanguageChange(e.target.value)}
          aria-label={t('studio.sourceLanguage')}
          className="w-full bg-transparent border-b border-ink/30 px-0 py-2 text-ink focus:outline-none focus:border-cinnabar transition-colors appearance-none font-mono text-[13px]"
        >
          {STUDIO_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang === 'auto' ? t('studio.autoDetect') : t(`languages.${lang}`)}
            </option>
          ))}
        </select>
      </SettingsBlock>

      <SettingsBlock
        label={`${t('studio.targetLanguage')} *`}
        sub={
          targetLanguages.length === 0 ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cinnabar">
              {t('studio.selectTargetLanguage')}
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
              {t('studio.languagesSelected', { count: targetLanguages.length })}
            </span>
          )
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-2">
          {STUDIO_LANGUAGES.filter((l) => l !== 'auto' && l !== sourceLanguage).map((lang) => {
            const checked = targetLanguages.includes(lang);
            return (
              <label
                key={lang}
                className="flex items-center gap-3 py-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTargetLanguageToggle(lang)}
                  className="hidden"
                />
                <span
                  className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                    checked ? 'border-ink bg-ink' : 'border-ink/40 group-hover:border-ink'
                  }`}
                >
                  {checked && <CheckIcon className="w-3 h-3 text-cream" />}
                </span>
                <span className={`text-[14px] ${checked ? 'text-ink' : 'text-ink-soft group-hover:text-ink'} transition-colors`}>
                  {t(`languages.${lang}`)}
                </span>
              </label>
            );
          })}
        </div>
      </SettingsBlock>

      <SettingsBlock label="Option · Lip-Sync">
        <label className="flex items-center gap-4 cursor-pointer">
          <button
            type="button"
            onClick={onWithLipSyncToggle}
            aria-pressed={withLipSync}
            className={`w-12 h-6 transition-colors relative border ${withLipSync ? 'bg-ink border-ink' : 'bg-transparent border-ink/40'}`}
          >
            <span
              className={`absolute top-[2px] w-4 h-4 transition-transform ${
                withLipSync ? 'translate-x-[26px] bg-cream' : 'translate-x-[2px] bg-ink/60'
              }`}
            />
          </button>
          <div>
            <span className="text-[14px] text-ink">{t('studio.progressLipSync')}</span>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mt-1">
              {t('studio.lipSyncProRequired')}
            </p>
          </div>
        </label>
      </SettingsBlock>

      <button
        type="button"
        onClick={onStartDubbing}
        disabled={targetLanguages.length === 0}
        aria-disabled={targetLanguages.length === 0}
        title={targetLanguages.length === 0 ? t('studio.selectTargetLanguage') : undefined}
        className="w-full bg-ink text-cream py-4 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {targetLanguages.length > 0 ? t('studio.startDubbing') : t('studio.selectTargetLanguage')}
        <span>→</span>
      </button>
    </div>
  );
}
