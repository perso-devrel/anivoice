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
import { getDownloadUrl, computeDubbingProgress, buildShareUrl, toggleArrayItem } from '../utils/studio';
import { StepIndicator, type Step } from '../components/StepIndicator';
import { SettingsStep } from '../components/SettingsStep';
import { UploadStep } from '../components/UploadStep';
import { ResultStep } from '../components/ResultStep';

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
          setError(t('studio.translationFailed', { reason: prog.progressReason }));
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
  }, [projectParam, spaceParam, t]);

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
        title: selectedFile?.name || t('studio.untitled'),
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
    setTargetLanguages((prev) => toggleArrayItem(prev, lang));
  }

  function handleFileReset() {
    setSelectedFile(null);
    setStep('upload');
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
        {step === 'result' && (
          <ResultStep
            loadingProject={loadingProject}
            isProcessing={isProcessing}
            processStage={processStage}
            progress={progress}
            remainingMinutes={remainingMinutes}
            error={error}
            downloadLinks={downloadLinks}
            projectSeq={projectSeq}
            spaceSeq={spaceSeq}
            withLipSync={withLipSync}
            sentences={sentences}
            editingValues={editingValues}
            savingSentence={savingSentence}
            isPublished={isPublished}
            isPublishing={isPublishing}
            tags={tags}
            selectedTags={selectedTags}
            dbProjectId={dbProjectId}
            linkCopied={linkCopied}
            onRetry={handleStartDubbing}
            onGoBack={() => { setError(null); setStep('settings'); }}
            onDownload={handleDownload}
            onRequestLipSync={handleRequestLipSync}
            onTagToggle={(tagId) => setSelectedTags((prev) => toggleArrayItem(prev, tagId))}
            onPublish={handlePublish}
            onCopyShareLink={handleCopyShareLink}
            onEditChange={(seq, value) => setEditingValues((prev) => ({ ...prev, [seq]: value }))}
            onSaveSentence={handleSaveSentence}
            onReset={handleResetProject}
          />
        )}
      </div>
    </main>
  );
}

