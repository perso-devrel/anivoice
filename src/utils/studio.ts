import type { PersoDownloadLinks, PersoScriptSentence } from '../types';

export const PROGRESS_GET_SPACE = 5;
export const PROGRESS_UPLOAD_START = 10;
export const PROGRESS_UPLOAD_DONE = 30;
export const PROGRESS_QUEUE_ENSURED = 33;
export const PROGRESS_TRANSLATION_REQUESTED = 35;
export const PROGRESS_POLL_COMPLETE = 90;
export const PROGRESS_SCRIPT_FETCHED = 95;

const DUBBING_PROGRESS_OFFSET = 35;
const DUBBING_PROGRESS_SCALE = 0.55;

type DownloadType = 'video' | 'subtitle' | 'audio' | 'zip';

export function getDownloadUrl(
  type: DownloadType,
  links: PersoDownloadLinks | null,
): string | undefined {
  if (!links) return undefined;
  switch (type) {
    case 'video':
      return links.videoFile?.videoDownloadLink;
    case 'subtitle':
      return links.srtFile?.translatedSubtitleDownloadLink
        || links.srtFile?.originalSubtitleDownloadLink;
    case 'audio':
      return links.audioFile?.voiceWithBackgroundAudioDownloadLink
        || links.audioFile?.voiceAudioDownloadLink;
    case 'zip':
      return links.zippedFileDownloadLink;
  }
}

export function computeDubbingProgress(pollProgress: number): number {
  return DUBBING_PROGRESS_OFFSET + pollProgress * DUBBING_PROGRESS_SCALE;
}

export function buildShareUrl(origin: string, dbProjectId: number | null): string {
  return dbProjectId
    ? `${origin}/archive/${dbProjectId}`
    : `${origin}/archive`;
}

export function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function formatSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(mil).padStart(3, '0')}`;
}

export function buildSrt(sentences: PersoScriptSentence[]): string {
  return sentences
    .map((s, i) => {
      const start = formatSrtTime(s.offsetMs);
      const end = formatSrtTime(s.offsetMs + s.durationMs);
      return `${i + 1}\n${start} --> ${end}\n${s.translatedText}`;
    })
    .join('\n\n');
}

export function downloadSrt(sentences: PersoScriptSentence[], filename = 'subtitle.srt') {
  const blob = new Blob([buildSrt(sentences)], { type: 'text/srt;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function computeDeductSeconds(durationMs: number, languageCount: number): number {
  return Math.ceil(durationMs / 1000) * Math.max(1, Math.floor(languageCount));
}
