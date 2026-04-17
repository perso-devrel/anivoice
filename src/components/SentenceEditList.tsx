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
    <div className="relative bg-ink border-2 border-bone/30 p-5 space-y-4">
      <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2">SCRIPT EDITOR</span>
      <h3 className="font-mono uppercase tracking-widest text-sm text-bone/90">{t('studio.editTranslation')}</h3>
      <div className="space-y-3">
        {sentences.map((s) => {
          const color = SPEAKER_COLORS[s.speakerOrderIndex % SPEAKER_COLORS.length];
          const isEditing = s.seq in editingValues;
          const isSaving = savingSentence === s.seq;

          return (
            <div key={s.seq} className="bg-void border border-bone/30 p-4 space-y-2 hover:border-bone/50 transition-colors">
              <div className="flex items-center gap-2 text-bone/50">
                <span className="w-2 h-2 shrink-0" style={{ backgroundColor: color }} />
                <span className="font-mono text-[10px] uppercase">{t('studio.speakerLabel', { index: s.speakerOrderIndex + 1 })}</span>
                <span className="ml-auto font-mono text-[10px] text-wire">{formatMs(s.offsetMs)} - {formatMs(s.offsetMs + s.durationMs)}</span>
                {s.matchingRate && (
                  <span className={`font-mono px-1.5 py-0.5 text-[10px] font-medium ${
                    s.matchingRate.level >= MATCHING_RATE_GOOD_THRESHOLD ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {s.matchingRate.levelType}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-sm text-bone/60 bg-ink px-3 py-2">
                  {s.originalText}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isEditing ? editingValues[s.seq] : s.translatedText}
                    onChange={(e) => onEditChange(s.seq, e.target.value)}
                    aria-label={t('studio.editTranslation')}
                    className="flex-1 text-sm text-bone bg-ink border-2 border-bone/30 px-3 py-2 focus:outline-none focus:border-lucy transition-colors"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onSave(s.seq)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-lucy text-void font-mono uppercase text-[10px] font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
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
