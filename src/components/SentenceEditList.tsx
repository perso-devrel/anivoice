import { useTranslation } from 'react-i18next';
import { formatMs } from '../utils/format';
import { SpinnerIcon } from './icons';
import type { PersoScriptSentence } from '../types';

const SPEAKER_COLORS = ['#a8362a', '#1a1815', '#5a544b', '#8a2a20', '#2b2724', '#8a8377'];
const MATCHING_RATE_GOOD_THRESHOLD = 3;

interface Props {
  sentences: PersoScriptSentence[];
  editingValues: Record<number, string>;
  savingSentence: number | null;
  onEditChange: (seq: number, value: string) => void;
  onSave: (seq: number) => void;
}

export function SentenceEditList({ sentences, editingValues, savingSentence, onEditChange, onSave }: Props) {
  const { t } = useTranslation();

  if (sentences.length === 0) return null;

  return (
    <div className="border-t border-ink/15 pt-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Script · Edit · 校訂
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
          {sentences.length} {t('studio.editTranslation')}
        </span>
      </div>
      <div className="divide-y divide-ink/15 border-t border-b border-ink/15">
        {sentences.map((s) => {
          const color = SPEAKER_COLORS[s.speakerOrderIndex % SPEAKER_COLORS.length];
          const isEditing = s.seq in editingValues;
          const isSaving = savingSentence === s.seq;
          const matchGood = s.matchingRate && s.matchingRate.level >= MATCHING_RATE_GOOD_THRESHOLD;

          return (
            <div key={s.seq} className="py-4 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: color }} />
                <span>{t('studio.speakerLabel', { index: s.speakerOrderIndex + 1 })}</span>
                <span className="text-ink/30">·</span>
                <span>{formatMs(s.offsetMs)} — {formatMs(s.offsetMs + s.durationMs)}</span>
                {s.matchingRate && (
                  <span className={`ml-auto px-2 py-0.5 border text-[10px] tracking-[0.18em] ${
                    matchGood ? 'border-ink text-ink' : 'border-cinnabar text-cinnabar'
                  }`}>
                    {s.matchingRate.levelType}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-[14px] text-ink-soft border-l border-ink/20 pl-3 py-1">
                  {s.originalText}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isEditing ? editingValues[s.seq] : s.translatedText}
                    onChange={(e) => onEditChange(s.seq, e.target.value)}
                    aria-label={t('studio.editTranslation')}
                    className="flex-1 text-[14px] text-ink bg-transparent border-b border-ink/30 px-0 py-1.5 focus:outline-none focus:border-cinnabar transition-colors"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onSave(s.seq)}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-ink text-cream font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors disabled:opacity-40"
                    >
                      {isSaving ? <SpinnerIcon className="w-3 h-3" /> : t('common.save')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
