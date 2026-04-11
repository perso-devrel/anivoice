import { useTranslation } from 'react-i18next';
import { formatMs } from '../utils/format';
import { SpinnerIcon } from './icons';
import type { PersoScriptSentence } from '../types';

const SPEAKER_COLORS = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c'];
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
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-surface-200/90">{t('studio.editTranslation')}</h3>
      <div className="space-y-3">
        {sentences.map((s) => {
          const color = SPEAKER_COLORS[s.speakerOrderIndex % SPEAKER_COLORS.length];
          const isEditing = s.seq in editingValues;
          const isSaving = savingSentence === s.seq;

          return (
            <div key={s.seq} className="bg-surface-900/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-surface-200/50">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>{t('studio.speakerLabel', { index: s.speakerOrderIndex + 1 })}</span>
                <span className="ml-auto">{formatMs(s.offsetMs)} - {formatMs(s.offsetMs + s.durationMs)}</span>
                {s.matchingRate && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    s.matchingRate.level >= MATCHING_RATE_GOOD_THRESHOLD ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {s.matchingRate.levelType}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-sm text-surface-200/60 bg-surface-800 rounded-lg px-3 py-2">
                  {s.originalText}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isEditing ? editingValues[s.seq] : s.translatedText}
                    onChange={(e) => onEditChange(s.seq, e.target.value)}
                    aria-label={t('studio.editTranslation')}
                    className="flex-1 text-sm text-white bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onSave(s.seq)}
                      disabled={isSaving}
                      className="px-3 py-2 rounded-lg gradient-bg text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
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
