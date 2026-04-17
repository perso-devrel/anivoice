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

const RESULT_CENTER_CLASS = 'max-w-lg mx-auto text-center py-12';
const RESULT_MUTED_TEXT = 'text-sm text-bone/60';

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
      <div className={`${RESULT_CENTER_CLASS} space-y-4`}>
        <LoadingSpinner className="w-10 h-10 mx-auto border-lucy" />
        <p className={RESULT_MUTED_TEXT}>{t('studio.loadingProject')}</p>
      </div>
    );
  }

  const flowType = getFlowType(processStage);
  const flowStages = FLOW_STAGES[flowType];
  const currentStageIdx = flowStages.findIndex(({ key }) => key === processStage);

  if (isProcessing) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-8`}>
        <h2 className="text-2xl text-bone font-display font-bold">{t('studio.processing')}</h2>

        <div className="space-y-2">
          <span className="font-mono uppercase tracking-widest text-bone/40 text-sm">PROCESSING...</span>
          <div className="flex items-center gap-4">
            <div className="flex-1 w-full bg-bone/10 h-2 overflow-hidden">
              <div
                className="h-full bg-lucy transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="font-mono text-lg text-bone">{Math.round(progress)}%</span>
          </div>
        </div>

        <p className={RESULT_MUTED_TEXT}>
          {remainingMinutes !== null && remainingMinutes > 0 && (
            <span className="text-bone/40">
              {t('studio.remainingTime', { minutes: remainingMinutes })}
            </span>
          )}
        </p>

        <div className="flex justify-between text-bone/50">
          {flowStages.map(({ key, i18nKey }, i) => (
            <span key={key} className={`font-mono uppercase text-[10px] tracking-wider transition-colors ${i <= currentStageIdx ? 'text-lucy font-medium' : ''}`}>
              {i <= currentStageIdx && (
                <span className="inline-block w-1.5 h-1.5 bg-lucy mr-1.5 align-middle animate-pulse" />
              )}
              {t(i18nKey)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${RESULT_CENTER_CLASS} space-y-4`}>
        <div className="w-16 h-16 mx-auto bg-rebecca/10 flex items-center justify-center">
          <AlertCircleIcon className="w-8 h-8 text-rebecca" />
        </div>
        <h2 className="font-mono uppercase tracking-wider text-xl font-bold text-rebecca">ERROR</h2>
        <p className={`${RESULT_MUTED_TEXT} break-words`}>{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onGoBack}
            className="px-4 py-2 border-2 border-bone/30 text-sm text-bone/80 hover:text-bone transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="bg-lucy text-void px-4 py-2 font-mono uppercase text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl text-bone font-display font-bold text-center mb-2">{t('studio.resultTitle')}</h2>

      <div className="relative bg-ink border-2 border-bone/30 overflow-hidden">
        {/* Corner crop markers */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-bone/30 pointer-events-none z-10" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-bone/30 pointer-events-none z-10" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-bone/30 pointer-events-none z-10" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-bone/30 pointer-events-none z-10" />

        {downloadLinks?.videoFile?.videoDownloadLink ? (
          <div className="relative">
            <video
              src={resolvePersoFileUrl(downloadLinks.videoFile.videoDownloadLink)}
              controls
              className="w-full aspect-video bg-black"
            />
            <div className="absolute inset-0 scanlines pointer-events-none" />
          </div>
        ) : (
          <div className="relative bg-black aspect-video flex items-center justify-center">
            <div className="w-16 h-16 bg-bone/10 flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-bone ml-1" />
            </div>
            <div className="absolute inset-0 scanlines pointer-events-none" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DOWNLOAD_BUTTONS.map(({ i18nKey, type }) => (
          <button
            key={type}
            type="button"
            onClick={() => onDownload(type)}
            disabled={!isDownloadAvailable(type, downloadLinks)}
            className="bg-ink border-2 border-bone/30 px-4 py-3 flex items-center justify-center gap-2 font-mono uppercase text-[11px] tracking-wider text-bone/80 hover:text-bone hover:border-bone transition-colors disabled:opacity-30"
          >
            <DownloadIcon className="w-4 h-4" />
            {t(i18nKey)}
          </button>
        ))}
      </div>

      {!withLipSync && projectSeq && spaceSeq && (
        <button
          type="button"
          onClick={onRequestLipSync}
          className="w-full bg-ink border-2 border-bone/30 px-4 py-3 font-mono uppercase text-sm text-wire hover:text-bone transition-colors"
        >
          {t('studio.progressLipSync')}
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
          className="w-full bg-david text-void font-mono font-bold uppercase tracking-widest border-2 border-david py-3 text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('studio.applyEdits')}
        </button>
      )}

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onReset}
          className="font-mono uppercase text-[11px] text-lucy hover:text-david transition-colors"
        >
          + {t('dashboard.newProject')}
        </button>
      </div>
    </div>
  );
}
