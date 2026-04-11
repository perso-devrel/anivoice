import type { PersoDownloadLinks } from '../types';

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
  return 35 + pollProgress * 0.55;
}

export function buildShareUrl(origin: string, dbProjectId: number | null): string {
  return dbProjectId
    ? `${origin}/library/${dbProjectId}`
    : `${origin}/library`;
}

export function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}
