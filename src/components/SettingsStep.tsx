import { useTranslation } from 'react-i18next';
import { FileIcon, CheckIcon } from './icons';
import { LANGUAGE_KEYS } from '../constants';

const STUDIO_LANGUAGES = ['auto', ...LANGUAGE_KEYS] as const;

function SettingsSection({ children, label, className = 'space-y-3' }: { children: React.ReactNode; label?: string; className?: string }) {
  return (
    <div className={`relative bg-ink border-2 border-bone/30 p-5 corner-marks ${className}`}>
      {label && (
        <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/30 bg-ink px-2">{label}</span>
      )}
      {children}
    </div>
  );
}

interface SettingsStepProps {
  selectedFile: File | null;
  sourceLanguage: string;
  targetLanguages: string[];
  onFileReset: () => void;
  onSourceLanguageChange: (lang: string) => void;
  onTargetLanguageToggle: (lang: string) => void;
  onStartDubbing: () => void;
}

export function SettingsStep({
  selectedFile,
  sourceLanguage,
  targetLanguages,
  onFileReset,
  onSourceLanguageChange,
  onTargetLanguageToggle,
  onStartDubbing,
}: SettingsStepProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl text-bone font-display font-bold mb-2">{t('studio.selectLanguage')}</h2>
      </div>

      {selectedFile && (
        <div className="bg-ink border-2 border-bone/30 px-4 py-3 flex items-center gap-3 text-sm text-bone/80">
          <FileIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={onFileReset}
            className="ml-auto text-xs text-bone/40 hover:text-red-400 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      <SettingsSection label="SOURCE">
        <label className="block font-mono uppercase text-[11px] tracking-widest text-bone/50">
          {t('studio.sourceLanguage')}
        </label>
        <select
          value={sourceLanguage}
          onChange={(e) => onSourceLanguageChange(e.target.value)}
          aria-label={t('studio.sourceLanguage')}
          className="w-full bg-void border-2 border-bone/30 px-4 py-2.5 text-sm text-bone focus:outline-none focus:border-lucy transition-colors appearance-none"
        >
          {STUDIO_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang === 'auto' ? t('studio.autoDetect') : t(`languages.${lang}`)}
            </option>
          ))}
        </select>
      </SettingsSection>

      <SettingsSection label="TARGET">
        <div className="flex items-center justify-between">
          <label className="block font-mono uppercase text-[11px] tracking-widest text-bone/50">
            {t('studio.targetLanguage')}
            <span className="ml-1 text-red-400" aria-hidden="true">*</span>
          </label>
          {targetLanguages.length === 0 ? (
            <span className="text-xs text-yellow-400/90">{t('studio.selectTargetLanguage')}</span>
          ) : (
            <span className="text-xs text-lucy">{t('studio.languagesSelected', { count: targetLanguages.length })}</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STUDIO_LANGUAGES.filter((l) => l !== 'auto' && l !== sourceLanguage).map((lang) => {
            const checked = targetLanguages.includes(lang);
            return (
              <label
                key={lang}
                className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border transition-all text-sm ${
                  checked
                    ? 'border-lucy bg-lucy/10 text-bone border-l-2'
                    : 'border-bone/30 bg-void text-bone/60 hover:border-bone/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTargetLanguageToggle(lang)}
                  className="hidden"
                />
                <span className={`w-4 h-4 border flex items-center justify-center shrink-0 ${checked ? 'border-lucy bg-lucy' : 'border-bone/30'}`}>
                  {checked && <CheckIcon className="w-3 h-3 text-void" />}
                </span>
                {t(`languages.${lang}`)}
              </label>
            );
          })}
        </div>
      </SettingsSection>

      <button
        type="button"
        onClick={onStartDubbing}
        disabled={targetLanguages.length === 0}
        aria-disabled={targetLanguages.length === 0}
        title={targetLanguages.length === 0 ? t('studio.selectTargetLanguage') : undefined}
        className="w-full bg-david text-void font-mono font-bold uppercase tracking-widest py-3 text-base border-2 border-david hover:bg-void hover:text-david transition-colors disabled:opacity-40 disabled:cursor-not-allowed flicker-on-hover"
      >
        {targetLanguages.length > 0 ? (<>EXECUTE DUBBING &#9654;</>) : t('studio.selectTargetLanguage')}
      </button>
    </div>
  );
}
