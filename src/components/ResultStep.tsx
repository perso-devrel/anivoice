import { useTranslation } from 'react-i18next';
import { resolvePersoFileUrl } from '../services/persoApi';
import type { Tag } from '../services/anivoiceApi';
import type { PersoScriptSentence, PersoDownloadLinks } from '../types';
import { PlayIcon, DownloadIcon, AlertCircleIcon, LoadingSpinner } from './icons';
import { SentenceEditList } from './SentenceEditList';
import { PublishSection } from './PublishSection';

type ProcessStage = 'uploading' | 'dubbing' | 're-dubbing' | 'lip-syncing' | 'done';

const FLOW_STAGES: Record<string, { key: string; i18nKey: string }[]> = {
  initial: [
    { key: 'uploading', i18nKey: 'studio.progressAnalyzing' },
    { key: 'dubbing', i18nKey: 'studio.progressDubbing' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
  editing: [
    { key: 're-dubbing', i18nKey: 'studio.progressEditing' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
  lipsync: [
    { key: 'lip-syncing', i18nKey: 'studio.progressLipSync' },
    { key: 'done', i18nKey: 'studio.progressComplete' },
  ],
};

function getFlowType(stage: ProcessStage): string {
  if (stage === 're-dubbing') return 'editing';
  if (stage === 'lip-syncing') return 'lipsync';
  return 'initial';
}

const RESULT_CENTER_CLASS = 'max-w-lg mx-auto text-center py-16';

const DOWNLOAD_BUTTONS = [
  { i18nKey: 'studio.downloadVideo', type: 'video' },
  { i18nKey: 'studio.downloadSubtitle', type: 'subtitle' },
  { i18nKey: 'studio.downloadAudio', type: 'audio' },
  { i18nKey: 'studio.downloadZip', type: 'zip' },
] as const;

function isDownloadAvailable(type: string, links: PersoDownloadLinks | null): boolean {
  if (!links) return false;
  switch (type) {
    case 'video': return !!links.videoFile?.videoDownloadLink;
    case 'subtitle': return !!(links.srtFile?.translatedSubtitleDownloadLink || links.srtFile?.originalSubtitleDownloadLink);
    case 'audio': return !!(links.audioFile?.voiceWithBackgroundAudioDownloadLink || links.audioFile?.voiceAudioDownloadLink);
    case 'zip': return !!links.zippedFileDownloadLink;
    default: return false;
  }
}

interface ResultStepProps {
  loadingProject: boolean;
  isProcessing: boolean;
  processStage: ProcessStage;
  progress: number;
  remainingMinutes: number | null;
  error: string | null;
  downloadLinks: PersoDownloadLinks | null;
  projectSeq: number | null;
  spaceSeq: number | null;
  withLipSync: boolean;
  sentences: PersoScriptSentence[];
  editingValues: Record<number, string>;
  savingSentence: number | null;
  isPublished: boolean;
  isPublishing: boolean;
  tags: Tag[];
  selectedTags: number[];
  dbProjectId: number | null;
  linkCopied: boolean;
  onRetry: () => void;
  onGoBack: () => void;
  onDownload: (type: 'video' | 'subtitle' | 'audio' | 'zip') => void;
  onRequestLipSync: () => void;
  onTagToggle: (tagId: number) => void;
  onPublish: () => void;
  onCopyShareLink: () => void;
  onEditChange: (seq: number, value: string) => void;
  onSaveSentence: (seq: number) => void;
  onApplyEdits: () => void;
  onReset: () => void;
}

export function ResultStep({
  loadingProject,
  isProcessing,
  processStage,
  progress,
  remainingMinutes,
  error,
  downloadLinks,
  projectSeq,
  spaceSeq,
  withLipSync,
  sentences,
  editingValues,
  savingSentence,
  isPublished,
  isPublishing,
  tags,
  selectedTags,
  dbProjectId,
  linkCopied,
  onRetry,
  onGoBack,
  onDownload,
  onRequestLipSync,
  onTagToggle,
  onPublish,
  onCopyShareLink,
  onEditChange,
  onSaveSentence,
  onApplyEdits,
  onReset,
}: ResultStepProps) {
  const { t } = useTranslation();

  if (loadingProject) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-5`}>
        <LoadingSpinner className="w-8 h-8 mx-auto border-ink" />
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute">
          {t('studio.loadingProject')}
        </p>
      </div>
    );
  }

  const flowType = getFlowType(processStage);
  const flowStages = FLOW_STAGES[flowType];
  const currentStageIdx = flowStages.findIndex(({ key }) => key === processStage);

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-10">
        <div className="border-t border-ink pt-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            Process · 進行
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
            {t('studio.processing')}
          </h2>
        </div>

        <div>
          <div className="h-px bg-ink/15 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-ink transition-all duration-700 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="font-display text-2xl text-ink">{Math.round(progress)}%</span>
            {remainingMinutes !== null && remainingMinutes > 0 && (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                {t('studio.remainingTime', { minutes: remainingMinutes })}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-ink/15 pt-5 grid grid-cols-3 gap-4">
          {flowStages.map(({ key, i18nKey }, i) => {
            const active = i <= currentStageIdx;
            const tone = active ? 'text-ink' : 'text-ink-mute';
            return (
              <div key={key} className="flex items-center gap-2">
                {active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-pulse shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/20 shrink-0" />
                )}
                <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${tone}`}>
                  {t(i18nKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-5`}>
        <AlertCircleIcon className="w-8 h-8 mx-auto text-cinnabar" />
        <h2 className="font-display text-3xl text-ink">{t('common.error')}</h2>
        <p className="text-ink-soft text-sm break-words max-w-md mx-auto">{error}</p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={onGoBack}
            className="px-5 py-2.5 border border-ink text-ink font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="bg-ink text-cream px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="border-t border-ink pt-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Result · Master · 完成
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
          {t('studio.resultTitle')}
        </h2>
      </div>

      <div className="border border-ink/20 overflow-hidden">
        {downloadLinks?.videoFile?.videoDownloadLink ? (
          <video
            src={resolvePersoFileUrl(downloadLinks.videoFile.videoDownloadLink)}
            controls
            className="w-full aspect-video bg-black"
          />
        ) : (
          <div className="relative bg-ink aspect-video flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-cream" />
          </div>
        )}
      </div>

      <div className="border-t border-ink/15 pt-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-3 block">
          {t('common.download') ?? 'Download · 配信'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DOWNLOAD_BUTTONS.map(({ i18nKey, type }) => (
            <button
              key={type}
              type="button"
              onClick={() => onDownload(type)}
              disabled={!isDownloadAvailable(type, downloadLinks)}
              className="border border-ink/30 px-4 py-3 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              {t(i18nKey)}
            </button>
          ))}
        </div>
      </div>

      {!withLipSync && projectSeq && spaceSeq && (
        <button
          type="button"
          onClick={onRequestLipSync}
          className="w-full border border-cinnabar/40 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-cinnabar hover:bg-cinnabar hover:text-cream transition-colors"
        >
          + {t('studio.progressLipSync')}
        </button>
      )}

      <PublishSection
        isPublished={isPublished}
        isPublishing={isPublishing}
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        dbProjectId={dbProjectId}
        linkCopied={linkCopied}
        onPublish={onPublish}
        onCopyShareLink={onCopyShareLink}
      />

      <SentenceEditList
        sentences={sentences}
        editingValues={editingValues}
        savingSentence={savingSentence}
        onEditChange={onEditChange}
        onSave={onSaveSentence}
      />

      {sentences.length > 0 && (
        <button
          type="button"
          onClick={onApplyEdits}
          disabled={isProcessing}
          className="w-full bg-ink text-cream py-4 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {t('studio.applyEdits')}
          <span>→</span>
        </button>
      )}

      <div className="text-center pt-4 border-t border-ink/15">
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-mute hover:text-cinnabar transition-colors mt-5"
        >
          + {t('dashboard.newProject')}
        </button>
      </div>
    </div>
  );
}
