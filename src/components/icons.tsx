import {
  File as PhFile,
  Play as PhPlay,
  DownloadSimple as PhDownloadSimple,
  Check as PhCheck,
  MagnifyingGlass as PhMagnifyingGlass,
  CaretDown as PhCaretDown,
  Clock as PhClock,
  X as PhX,
  Plus as PhPlus,
  WarningCircle as PhWarningCircle,
  UploadSimple as PhUploadSimple,
  CheckCircle as PhCheckCircle,
  ArrowRight as PhArrowRight,
  Info as PhInfo,
  List as PhList,
  Star as PhStar,
  LinkSimple as PhLinkSimple,
  CaretLeft as PhCaretLeft,
  ArrowLeft as PhArrowLeft,
  Wallet as PhWallet,
  ArrowsClockwise as PhArrowsClockwise,
  Microphone as PhMicrophone,
  Globe as PhGlobe,
  PencilSimple as PhPencilSimple,
  Faders as PhFaders,
  Translate as PhTranslate,
  SortAscending as PhSortAscending,
  PlayCircle as PhPlayCircle,
  User as PhUser,
} from '@phosphor-icons/react';

type IconProps = { className?: string };

export function FileIcon({ className = 'w-12 h-12' }: IconProps) {
  return <PhFile className={className} weight="regular" />;
}

export function PlayIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhPlay className={className} weight="fill" />;
}

export function DownloadIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhDownloadSimple className={className} weight="regular" />;
}

export function CheckIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhCheck className={className} weight="regular" />;
}

export function SpinnerIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 border-2 border-current animate-spin" style={{ animationTimingFunction: 'steps(8)' }} />
    </div>
  );
}

export function SearchIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhMagnifyingGlass className={className} weight="regular" />;
}

export function ChevronDownIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhCaretDown className={className} weight="regular" />;
}

export function ClockIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return <PhClock className={className} weight="regular" />;
}

export function XIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhX className={className} weight="regular" />;
}

export function PlusIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhPlus className={className} weight="regular" />;
}

export function AlertCircleIcon({ className = 'w-6 h-6' }: IconProps) {
  return <PhWarningCircle className={className} weight="regular" />;
}

export function UploadIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhUploadSimple className={className} weight="regular" />;
}

export function CheckCircleIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhCheckCircle className={className} weight="regular" />;
}

export function ArrowRightIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhArrowRight className={className} weight="regular" />;
}

export function CheckmarkIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhCheck className={className} weight="regular" />;
}

export function InfoIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhInfo className={className} weight="regular" />;
}

export function MenuIcon({ className = 'w-6 h-6' }: IconProps) {
  return <PhList className={className} weight="regular" />;
}

export function StarIcon({ className = 'w-4 h-4', fill = 'none' }: IconProps & { fill?: string }) {
  const weight = fill !== 'none' ? 'fill' as const : 'regular' as const;
  return <PhStar className={className} weight={weight} />;
}

export function LinkIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhLinkSimple className={className} weight="regular" />;
}

export function ChevronLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PhCaretLeft className={className} weight="regular" />;
}

export function ArrowLeftIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhArrowLeft className={className} weight="regular" />;
}

export function WalletIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhWallet className={className} weight="regular" />;
}

export function RefreshIcon({ className = 'w-5 h-5' }: IconProps) {
  return <PhArrowsClockwise className={className} weight="regular" />;
}

export function VoiceIcon({ className = 'w-8 h-8' }: IconProps) {
  return <PhMicrophone className={className} weight="regular" />;
}

export function GlobeIcon({ className = 'w-8 h-8' }: IconProps) {
  return <PhGlobe className={className} weight="regular" />;
}


export function EditIcon({ className = 'w-8 h-8' }: IconProps) {
  return <PhPencilSimple className={className} weight="regular" />;
}

export function SettingsIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhFaders className={className} weight="regular" />;
}

export function TranslateIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhTranslate className={className} weight="regular" />;
}

export function SortIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return <PhSortAscending className={className} weight="regular" />;
}

export function VideoPlayIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhPlayCircle className={className} weight="fill" />;
}

export function UserIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhUser className={className} weight="regular" />;
}

export function LoadingSpinner({ className = 'w-8 h-8 border-primary-500' }: IconProps) {
  return (
    <div className={`${className} border-2 border-t-transparent animate-spin`} />
  );
}

export function EmptyProjectsIcon({ className = 'w-16 h-16' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="14" width="48" height="36" rx="4" stroke="url(#emptyProjGrad)" strokeWidth="2.5" />
      <path d="M8 22h48" stroke="url(#emptyProjGrad)" strokeWidth="2" opacity="0.5" />
      <circle cx="32" cy="36" r="8" stroke="url(#emptyProjGrad)" strokeWidth="2.5" />
      <polygon points="30,33 30,39 36,36" fill="url(#emptyProjGrad)" />
      <path d="M44 10l4-4m0 0l4 4m-4-4v8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx="14" cy="10" r="2" fill="#f97316" opacity="0.5" />
      <circle cx="52" cy="54" r="1.5" fill="#f43f5e" opacity="0.5" />
      <defs>
        <linearGradient id="emptyProjGrad" x1="8" y1="14" x2="56" y2="50">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GoogleIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.04 24.04 0 000 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
