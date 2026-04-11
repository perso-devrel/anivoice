import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useClipboard } from '../hooks/useClipboard';
import { useSearchParams } from 'react-router-dom';
import {
  listSpaces,
  uploadVideoFile,
  ensureSpaceQueue,
  requestTranslation,
  pollProgress,
  getScript,
  getProgress,
  translateSentence,
  generateSentenceAudio,
  requestLipSync,
  getDownloadLinks,
  resolvePersoFileUrl,
} from '../services/persoApi';
import { createProject, updateProject, deductCredits, getTags, publishProject } from '../services/anivoiceApi';
import { useAuthStore } from '../stores/authStore';
import type { Tag } from '../services/anivoiceApi';
import type { PersoProgress, PersoScriptSentence, PersoDownloadLinks } from '../types';
import { getErrorMessage } from '../utils/format';
import { getDownloadUrl, computeDubbingProgress, buildShareUrl } from '../utils/studio';
import { PlayIcon, DownloadIcon, AlertCircleIcon, LoadingSpinner } from '../components/icons';
import { SentenceEditList } from '../components/SentenceEditList';
import { StepIndicator, type Step } from '../components/StepIndicator';
import { PublishSection } from '../components/PublishSection';
import { SettingsStep } from '../components/SettingsStep';
import { UploadStep } from '../components/UploadStep';

const STAGE_ORDER = ['uploading', 'dubbing', 'lip-syncing', 'done'] as const;

const PROGRESS_STAGE_I18N = [
  { key: 'uploading', i18nKey: 'studio.progressAnalyzing' },
  { key: 'dubbing', i18nKey: 'studio.progressDubbing' },
  { key: 'lip-syncing', i18nKey: 'studio.progressLipSync' },
] as const;

export default function StudioPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.studio');

  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [withLipSync, setWithLipSync] = useState(false);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState<'uploading' | 'dubbing' | 'lip-syncing' | 'done'>('uploading');
  const [progress, setProgress] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Result
  const [projectSeq, setProjectSeq] = useState<number | null>(null);
  const [spaceSeq, setSpaceSeq] = useState<number | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<PersoDownloadLinks | null>(null);
  const [sentences, setSentences] = useState<PersoScriptSentence[]>([]);
  const [editingValues, setEditingValues] = useState<Record<number, string>>({});
  const [savingSentence, setSavingSentence] = useState<number | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  // DB project tracking
  const [dbProjectId, setDbProjectId] = useState<number | null>(null);

  // Publish
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const { copied: linkCopied, copy: copyToClipboard } = useClipboard();

  // Store uploaded file info for use after polling
  const uploadedFileRef = useRef<{ seq: number; durationMs: number } | null>(null);

  // Fetch tags on mount
  useEffect(() => { getTags().then(setTags).catch(() => {}); }, []);

  const projectParam = searchParams.get('project');
  const spaceParam = searchParams.get('space');

  useEffect(() => {
    if (!projectParam || !spaceParam) return;

    const pSeq = Number(projectParam);
    const sSeq = Number(spaceParam);
    if (isNaN(pSeq) || isNaN(sSeq)) return;

    setProjectSeq(pSeq);
    setSpaceSeq(sSeq);
    setStep('result');
    setLoadingProject(true);

    async function loadExistingProject() {
      try {
        // Check progress
        const prog = await getProgress(pSeq, sSeq);
        const reason = (prog.progressReason || '').toUpperCase();
        const isComplete = reason === 'COMPLETED' || prog.progress >= 100;

        if (!isComplete && !prog.hasFailed) {
          // Still processing — poll
          setIsProcessing(true);
          setProcessStage('dubbing');
          setProgress(prog.progress);
          await pollProgress(pSeq, sSeq, (p: PersoProgress) => {
            setProgress(p.progress);
            if (p.expectedRemainingTimeMinutes > 0) {
              setRemainingMinutes(p.expectedRemainingTimeMinutes);
            }
          });
        }

        if (prog.hasFailed) {
          setError(`Translation failed: ${prog.progressReason}`);
          setLoadingProject(false);
          setIsProcessing(false);
          return;
        }

        // Load script
        try {
          const script = await getScript(pSeq, sSeq);
          setSentences(script.sentences);
        } catch { /* script not ready */ }

        // Load downloads
        try {
          const links = await getDownloadLinks(pSeq, sSeq);
          setDownloadLinks(links);
        } catch { /* downloads not ready */ }

        setProgress(100);
        setProcessStage('done');
        setIsProcessing(false);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsProcessing(false);
      } finally {
        setLoadingProject(false);
      }
    }

    loadExistingProject();
  }, [projectParam, spaceParam]);

  /* ── step indicator ── */
  const stepLabels: Record<Step, string> = {
    upload: t('common.upload'),
    settings: t('studio.selectLanguage'),
    result: t('studio.resultTitle'),
  };

  /* ── handlers ── */

  function handleFileChange(file: File) {
    setSelectedFile(file);
    setError(null);
    setStep('settings');
  }

  const handleStartDubbing = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setRemainingMinutes(null);
    setStep('result');
    setProcessStage('uploading');
    setProgress(0);

    try {
      if (targetLanguages.length === 0 || targetLanguages.every((l) => l === sourceLanguage)) {
        throw new Error(t('studio.selectTargetLanguage'));
      }

      // 1. Get user's space
      setProgress(5);
      const spaces = await listSpaces();
      if (spaces.length === 0) {
        throw new Error(t('studio.noWorkspaceError'));
      }
      const space = spaces[0];
      setSpaceSeq(space.spaceSeq);

      // 2. Upload file
      setProgress(10);
      let uploadedFile;
      if (selectedFile) {
        uploadedFile = await uploadVideoFile(space.spaceSeq, selectedFile);
      } else {
        throw new Error(t('studio.noFileError'));
      }
      setProgress(30);
      uploadedFileRef.current = uploadedFile;

      // 3. Ensure the queue exists before the first translation request
      setProgress(33);
      await ensureSpaceQueue(space.spaceSeq);

      // 4. Request translation (dubbing)
      setProcessStage('dubbing');
      setProgress(35);
      const projectIds = await requestTranslation(space.spaceSeq, {
        mediaSeq: uploadedFile.seq,
        isVideoProject: true,
        sourceLanguageCode: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        targetLanguageCodes: targetLanguages,
        numberOfSpeakers: 1,
        withLipSync,
        preferredSpeedType: 'GREEN',
      });

      const primaryProjectSeq = projectIds[0];
      if (!primaryProjectSeq) {
        throw new Error(t('studio.noDubbingProjectId'));
      }
      setProjectSeq(primaryProjectSeq);

      // Create project record in DB
      const dbProject = await createProject({
        title: selectedFile?.name || 'Untitled',
        originalFileName: selectedFile?.name,
        sourceLanguage,
        targetLanguage: targetLanguages.join(','),
        durationMs: uploadedFile.durationMs,
        persoProjectSeq: primaryProjectSeq,
        persoSpaceSeq: space.spaceSeq,
      });
      setDbProjectId(dbProject.id);

      // 5. Poll progress (every 5 seconds)
      await pollProgress(primaryProjectSeq, space.spaceSeq, (p: PersoProgress) => {
        setProgress(computeDubbingProgress(p.progress));
        if (p.expectedRemainingTimeMinutes > 0) {
          setRemainingMinutes(p.expectedRemainingTimeMinutes);
        }
      });

      setProgress(90);

      // 6. Fetch script for editing
      setProcessStage('done');
      setProgress(95);
      try {
        const script = await getScript(primaryProjectSeq, space.spaceSeq);
        setSentences(script.sentences);
      } catch {
        // Script may not be ready yet — ok to continue
      }

      // 7. Fetch download links
      let links: PersoDownloadLinks | null = null;
      try {
        links = await getDownloadLinks(primaryProjectSeq, space.spaceSeq);
        setDownloadLinks(links);
      } catch {
        // Downloads may not be available yet
      }

      // 8. Update DB project with completed status
      if (dbProject.id && links) {
        await updateProject(dbProject.id, {
          status: 'completed',
          progress: 100,
          videoUrl: links.videoFile?.videoDownloadLink,
          audioUrl: links.audioFile?.voiceWithBackgroundAudioDownloadLink || links.audioFile?.voiceAudioDownloadLink,
          zipUrl: links.zippedFileDownloadLink,
        });
        // Deduct credits
        try {
          const result = await deductCredits(dbProject.id, uploadedFile.durationMs, targetLanguages.length);
          useAuthStore.getState().setCreditSeconds(result.remainingSeconds);
        } catch { /* credits may not be set up yet */ }
      }

      setProgress(100);
      setRemainingMinutes(null);
      setIsProcessing(false);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setRemainingMinutes(null);
      setIsProcessing(false);
    }
  }, [selectedFile, sourceLanguage, targetLanguages, withLipSync, t]);

  async function handleSaveSentence(sentenceSeq: number) {
    if (!projectSeq || !(sentenceSeq in editingValues)) return;
    setSavingSentence(sentenceSeq);
    try {
      const newText = editingValues[sentenceSeq];
      // Update translation text
      await translateSentence(projectSeq, sentenceSeq, newText);
      // Regenerate audio for this sentence
      await generateSentenceAudio(projectSeq, sentenceSeq, newText);

      setSentences((prev) =>
        prev.map((s) =>
          s.seq === sentenceSeq ? { ...s, translatedText: newText } : s
        ),
      );
      setEditingValues((prev) => {
        const next = { ...prev };
        delete next[sentenceSeq];
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingSentence(null);
    }
  }

  async function handleRequestLipSync() {
    if (!projectSeq || !spaceSeq) return;
    setProcessStage('lip-syncing');
    setIsProcessing(true);
    setProgress(50);
    try {
      const lipSyncIds = await requestLipSync(projectSeq, spaceSeq);
      const lipSyncProjectSeq = lipSyncIds[0];
      if (!lipSyncProjectSeq) {
        throw new Error(t('studio.noLipSyncProjectId'));
      }
      // Poll lip sync project progress
      await pollProgress(lipSyncProjectSeq, spaceSeq, (p) => {
        setProgress(50 + (p.progress * 0.5));
      });
      // Refresh download links
      const links = await getDownloadLinks(projectSeq, spaceSeq);
      setDownloadLinks(links);
      setIsProcessing(false);
      setProcessStage('done');
      setProgress(100);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsProcessing(false);
    }
  }

  function handleDownload(type: 'video' | 'subtitle' | 'audio' | 'zip') {
    const path = getDownloadUrl(type, downloadLinks);
    if (path) {
      const fullUrl = resolvePersoFileUrl(path);
      if (fullUrl) {
        window.open(fullUrl, '_blank');
      }
    }
  }

  async function handlePublish() {
    if (!dbProjectId) return;
    setIsPublishing(true);
    try {
      await publishProject(dbProjectId, selectedTags);
      setIsPublished(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCopyShareLink() {
    const url = buildShareUrl(window.location.origin, dbProjectId);
    try {
      await copyToClipboard(url);
    } catch {
      setError(t('studio.clipboardError'));
    }
  }

  function handleSourceLanguageChange(nextSourceLanguage: string) {
    setSourceLanguage(nextSourceLanguage);
    setTargetLanguages((prev) => prev.filter((l) => l !== nextSourceLanguage));
  }

  function handleTargetLanguageToggle(lang: string) {
    setTargetLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  function handleFileReset() {
    setSelectedFile(null);
    setStep('upload');
  }

  /* ── step: result ── */

  function ResultStep() {
    if (loadingProject) {
      return (
        <div className="max-w-lg mx-auto text-center py-12 space-y-4">
          <LoadingSpinner className="w-10 h-10 mx-auto border-primary-400" />
          <p className="text-surface-200/60 text-sm">{t('studio.loadingProject')}</p>
        </div>
      );
    }

    const progressLabels = PROGRESS_STAGE_I18N.map(({ key, i18nKey }) => ({ key, label: t(i18nKey) }));
    const currentStageIdx = STAGE_ORDER.indexOf(processStage as typeof STAGE_ORDER[number]);

    if (isProcessing) {
      return (
        <div className="max-w-lg mx-auto space-y-8 text-center py-12">
          <h2 className="text-2xl font-bold gradient-text">{t('studio.processing')}</h2>

          <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-sm text-surface-200/60">
            {Math.round(progress)}%
            {remainingMinutes !== null && remainingMinutes > 0 && (
              <span className="ml-2 text-surface-200/40">
                {t('studio.remainingTime', { minutes: remainingMinutes })}
              </span>
            )}
          </p>

          <div className="flex justify-between text-xs text-surface-200/50">
            {progressLabels.map(({ key, label }, i) => (
              <span key={key} className={`transition-colors ${i <= currentStageIdx ? 'text-primary-400 font-medium' : ''}`}>
                {i <= currentStageIdx && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 mr-1.5 align-middle animate-pulse" />
                )}
                {label}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Error
    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400">{t('common.error')}</h2>
          <p className="text-sm text-surface-200/60 break-words">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => { setError(null); setStep('settings'); }}
              className="px-4 py-2 rounded-lg border border-surface-700 text-sm text-surface-200/80 hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleStartDubbing}
              className="gradient-bg px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      );
    }

    // Success
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold gradient-text text-center mb-2">{t('studio.resultTitle')}</h2>

        {/* video player */}
        <div className="glass rounded-2xl overflow-hidden">
          {downloadLinks?.videoFile?.videoDownloadLink ? (
            <video
              src={resolvePersoFileUrl(downloadLinks.videoFile.videoDownloadLink)}
              controls
              className="w-full aspect-video bg-black"
            />
          ) : (
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <PlayIcon className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* download buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: t('studio.downloadVideo'), type: 'video' as const, available: !!downloadLinks?.videoFile?.videoDownloadLink },
            { label: t('studio.downloadSubtitle'), type: 'subtitle' as const, available: !!(downloadLinks?.srtFile?.translatedSubtitleDownloadLink || downloadLinks?.srtFile?.originalSubtitleDownloadLink) },
            { label: t('studio.downloadAudio'), type: 'audio' as const, available: !!(downloadLinks?.audioFile?.voiceWithBackgroundAudioDownloadLink || downloadLinks?.audioFile?.voiceAudioDownloadLink) },
            { label: t('studio.downloadZip'), type: 'zip' as const, available: !!downloadLinks?.zippedFileDownloadLink },
          ]).map(({ label, type, available }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleDownload(type)}
              disabled={!available}
              className="glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm text-surface-200/80 hover:text-white hover:border-primary-500/40 transition-colors disabled:opacity-30"
            >
              <DownloadIcon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* lip sync button (if not already applied) */}
        {!withLipSync && projectSeq && spaceSeq && (
          <button
            type="button"
            onClick={handleRequestLipSync}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-accent-400 hover:text-white hover:border-accent-500/40 transition-colors"
          >
            {t('studio.progressLipSync')} {t('studio.proBadge')}
          </button>
        )}

        {/* publish section */}
        <PublishSection
          isPublished={isPublished}
          isPublishing={isPublishing}
          tags={tags}
          selectedTags={selectedTags}
          onTagToggle={(tagId) =>
            setSelectedTags((prev) =>
              prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
            )
          }
          dbProjectId={dbProjectId}
          linkCopied={linkCopied}
          onPublish={handlePublish}
          onCopyShareLink={handleCopyShareLink}
        />

        {/* translation edit */}
        <SentenceEditList
          sentences={sentences}
          editingValues={editingValues}
          savingSentence={savingSentence}
          onEditChange={(seq, value) => setEditingValues((prev) => ({ ...prev, [seq]: value }))}
          onSave={handleSaveSentence}
        />

        {/* new project */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleResetProject}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            + {t('dashboard.newProject')}
          </button>
        </div>
      </div>
    );
  }

  function handleResetProject() {
    setStep('upload');
    setSelectedFile(null);
    setTargetLanguages([]);
    setProjectSeq(null);
    setSpaceSeq(null);
    setDownloadLinks(null);
    setSentences([]);
    setEditingValues({});
    setError(null);
    setProgress(0);
    setWithLipSync(false);
    setDbProjectId(null);
    setSelectedTags([]);
    setIsPublished(false);
  }

  /* ── render ── */

  return (
    <main className="min-h-screen bg-surface-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <StepIndicator currentStep={step} labels={stepLabels} />
        {step === 'upload' && <UploadStep onFileChange={handleFileChange} />}
        {step === 'settings' && (
          <SettingsStep
            selectedFile={selectedFile}
            sourceLanguage={sourceLanguage}
            targetLanguages={targetLanguages}
            withLipSync={withLipSync}
            onFileReset={handleFileReset}
            onSourceLanguageChange={handleSourceLanguageChange}
            onTargetLanguageToggle={handleTargetLanguageToggle}
            onWithLipSyncToggle={() => setWithLipSync(!withLipSync)}
            onStartDubbing={handleStartDubbing}
          />
        )}
        {step === 'result' && ResultStep()}
      </div>
    </main>
  );
}

