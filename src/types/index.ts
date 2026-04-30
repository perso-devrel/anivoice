export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  creditSeconds: number;
  language: SupportedLanguage;
  createdAt: string;
  emailVerified?: boolean;
  providerId?: string;
}

export type SupportedLanguage = 'ja' | 'ko' | 'en' | 'es' | 'pt' | 'id' | 'ar' | 'zh';

export type ProjectStatus = 'uploading' | 'analyzing' | 'dubbing' | 'completed' | 'failed';

// Perso API types

export interface PersoSpaceBanner {
  spaceSeq: number;
  spaceName: string;
  planName: string;
  tier: string;
  logo: string;
  memberCount: number;
  seat: number;
  isDefaultSpaceOwned: boolean;
  memberRole: string;
  useVideoTranslatorEdit: boolean;
}

export interface PersoUploadedFile {
  seq: number;
  originalName: string;
  videoFilePath: string;
  thumbnailFilePath: string;
  size: number;
  durationMs: number;
}

export interface PersoProgress {
  projectSeq: number;
  progress: number;
  progressReason: string;
  hasFailed: boolean;
  speedType: string;
  expectedRemainingTimeMinutes: number;
  isCancelable: boolean;
}

export interface PersoScriptSentence {
  seq: number;
  speakerOrderIndex: number;
  offsetMs: number;
  durationMs: number;
  originalText: string;
  translatedText: string;
  audioUrl?: string;
  matchingRate?: { level: number; levelType: string };
}

export interface PersoDownloadLinks {
  videoFile?: { videoDownloadLink: string };
  audioFile?: {
    voiceAudioDownloadLink: string;
    backgroundAudioDownloadLink: string;
    voiceWithBackgroundAudioDownloadLink: string;
  };
  srtFile?: {
    originalSubtitleDownloadLink: string;
    translatedSubtitleDownloadLink: string;
  };
  zippedFileDownloadLink?: string;
}
