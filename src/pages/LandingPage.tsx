import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { UploadIcon, VoiceIcon, GlobeIcon, LipSyncIcon, EditIcon, SettingsIcon, DownloadIcon, PlayIcon, ChevronDownIcon, ClockIcon } from '../components/icons';
import { SUPPORTED_LANGUAGES } from '../constants';
import { CREDIT_PRICE_PER_MINUTE_USD, TIME_PACK_10_MIN_SECONDS, TIME_PACK_50_MIN_SECONDS, TIME_PACK_100_MIN_SECONDS, TIME_PACK_10_MIN_PRICE, TIME_PACK_50_MIN_PRICE, TIME_PACK_100_MIN_PRICE } from '../utils/pricing';

const FAQ_KEYS = [
  { qKey: 'landing.faqVoiceQ', aKey: 'landing.faqVoiceA' },
  { qKey: 'landing.faqLimitQ', aKey: 'landing.faqLimitA' },
  { qKey: 'landing.faqFormatQ', aKey: 'landing.faqFormatA' },
  { qKey: 'landing.faqEditQ', aKey: 'landing.faqEditA' },
];

const FEATURE_KEYS = [
  { iconId: 'voice', titleKey: 'landing.featureVoice', descKey: 'landing.featureVoiceDesc' },
  { iconId: 'globe', titleKey: 'landing.featureLang', descKey: 'landing.featureLangDesc' },
  { iconId: 'lipSync', titleKey: 'landing.featureLipSync', descKey: 'landing.featureLipSyncDesc' },
  { iconId: 'edit', titleKey: 'landing.featureEdit', descKey: 'landing.featureEditDesc' },
] as const;

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  voice: <VoiceIcon />,
  globe: <GlobeIcon />,
  lipSync: <LipSyncIcon />,
  edit: <EditIcon />,
};

const STEP_KEYS = [
  { iconId: 'upload', titleKey: 'landing.step1', descKey: 'landing.step1Desc' },
  { iconId: 'settings', titleKey: 'landing.step2', descKey: 'landing.step2Desc' },
  { iconId: 'download', titleKey: 'landing.step3', descKey: 'landing.step3Desc' },
] as const;

const STEP_ICONS: Record<string, React.ReactNode> = {
  upload: <UploadIcon />,
  settings: <SettingsIcon />,
  download: <DownloadIcon className="w-10 h-10" />,
};

const CREDIT_PACKS = [
  { seconds: TIME_PACK_10_MIN_SECONDS, labelKey: 'pricing.timePack10', price: TIME_PACK_10_MIN_PRICE },
  { seconds: TIME_PACK_50_MIN_SECONDS, labelKey: 'pricing.timePack50', price: TIME_PACK_50_MIN_PRICE },
  { seconds: TIME_PACK_100_MIN_SECONDS, labelKey: 'pricing.timePack100', price: TIME_PACK_100_MIN_PRICE },
];

const STEP_SFX = ['ドン', 'バン', 'ズキュン'];
const STEP_ACCENTS = ['text-lucy', 'text-wire', 'text-david'];
const FEATURE_SFX = ['声', '語', '口', '書'];

const SAMPLE_VIDEO_ORIGINAL = '/sample_original_ja.mp4';
const SAMPLE_VIDEO_DUBBED = '/sample_dubbed_en.mp4';

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function VideoPreviewBox({
  badgeLabel,
  badgeClass,
  langLabel,
  src,
}: {
  badgeLabel: string;
  badgeClass: string;
  langLabel: string;
  src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden bg-ink aspect-video group cursor-pointer border-2 border-bone"
      onClick={handleToggle}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        preload="metadata"
        playsInline
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div className="absolute inset-0 bg-void/50 flex items-center justify-center transition-opacity">
          <div className="w-20 h-20 bg-bone flex items-center justify-center border-2 border-bone group-hover:bg-lucy group-hover:border-lucy transition-colors">
            <PlayIcon className="w-8 h-8 text-void ml-0.5" />
          </div>
        </div>
      )}
      <span className={`absolute top-0 left-0 ${badgeClass} font-display font-bold text-xs uppercase tracking-widest px-4 py-2 border-b-2 border-r-2 border-bone`}>
        {badgeLabel}
      </span>
      <span className="absolute bottom-0 right-0 bg-void font-mono text-[10px] uppercase tracking-widest text-bone/70 px-3 py-2 border-t-2 border-l-2 border-bone">
        {langLabel}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative bg-ink border-2 border-bone p-6 group transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:offset-lucy-sm">
      <div className="w-12 h-12 bg-bone text-void flex items-center justify-center mb-6 border-2 border-bone group-hover:bg-david group-hover:border-david transition-colors">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-bone mb-2 leading-tight">{title}</h3>
      <p className="text-bone/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({
  num,
  title,
  desc,
  icon,
  isLast,
}: {
  num: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  isLast: boolean;
}) {
  const sfx = STEP_SFX[num - 1] ?? '';
  const accent = STEP_ACCENTS[num - 1] ?? 'text-lucy';

  return (
    <div className="relative bg-ink border-2 border-bone p-8 flex flex-col min-h-[320px] overflow-hidden">
      {/* huge sound-effect typography */}
      <span
        aria-hidden
        className={`absolute -top-6 -right-4 font-jp font-black text-[7rem] leading-none ${accent} opacity-90 select-none pointer-events-none`}
        style={{ transform: 'rotate(-6deg)' }}
      >
        {sfx}
      </span>
      <div className="relative z-10 font-mono text-xs uppercase tracking-widest text-bone/50">
        STEP / {String(num).padStart(2, '0')}
      </div>
      <div className="relative z-10 mt-8 text-bone">{icon}</div>
      <h3 className="relative z-10 mt-4 font-display font-bold text-2xl text-bone leading-tight">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-bone/60 text-sm leading-relaxed max-w-xs">
        {desc}
      </p>
      {!isLast && (
        <div aria-hidden className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-bone z-20">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-bone" />
        </div>
      )}
    </div>
  );
}

function CreditPackCard({
  label,
  price,
}: {
  label: string;
  price: number;
}) {
  return (
    <div className="relative bg-ink border-2 border-bone p-8 flex flex-col text-left transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:offset-david-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-bone text-void flex items-center justify-center">
          <ClockIcon className="w-5 h-5" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-bone/50">PACK</span>
      </div>
      <p className="font-display font-black text-3xl text-bone leading-none mb-2">{label}</p>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="font-mono text-xs text-bone/60">USD</span>
        <span className="font-display font-black text-5xl text-david leading-none">${price}</span>
      </div>
      <Link
        to="/pricing"
        className="mt-auto inline-flex items-center justify-between border-2 border-bone text-bone font-display font-bold uppercase tracking-widest text-xs px-4 py-3 hover:bg-bone hover:text-void transition-colors"
      >
        <span>{label}</span>
        <span>→</span>
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t-2 border-bone last:border-b-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 px-4 md:px-6 text-left group hover:bg-ink transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-start gap-4 pr-4">
          <span className="font-mono text-xs uppercase tracking-widest text-lucy mt-1.5">Q.</span>
          <span className="font-display font-bold text-base md:text-lg text-bone leading-snug">
            {question}
          </span>
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-bone shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-60' : 'max-h-0'
        }`}
      >
        <div className="flex items-start gap-4 pl-4 md:pl-6 pr-10 pb-6 bg-ink">
          <span className="font-mono text-xs uppercase tracking-widest text-david mt-0.5">A.</span>
          <p className="text-bone/70 text-sm md:text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                      */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.landing');

  const heroLines = t('landing.heroTitle').split('\n');
  const heroLine1 = heroLines[0] ?? '';
  const heroLine2 = heroLines[1] ?? '';

  return (
    <main className="min-h-screen bg-void text-bone overflow-x-hidden font-body selection:bg-lucy selection:text-void">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden scanlines film-grain border-b-2 border-bone">
        {/* Giant background katakana graffiti */}
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
          <span
            className="absolute -left-4 top-[8%] font-jp font-black leading-none text-outline-bone opacity-[0.12]"
            style={{ fontSize: 'clamp(120px, 28vw, 420px)' }}
          >
            ボイス
          </span>
          <span
            className="absolute right-[-2vw] bottom-[-4vw] font-jp font-black leading-none text-lucy opacity-[0.10]"
            style={{ fontSize: 'clamp(180px, 40vw, 640px)' }}
          >
            声
          </span>
          <span
            className="absolute right-[6%] top-[18%] font-jp font-bold text-wire opacity-25 text-sm md:text-base tracking-[0.3em]"
          >
            ANI / VOICE / DUBBING
          </span>
        </div>

        {/* Top meta strip */}
        <div className="relative z-10 px-6 md:px-12 pt-24 md:pt-28 flex items-center justify-between font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-bone/60">
          <span className="flex items-center gap-2">
            <span className="block w-2 h-2 bg-lucy" />
            EP.01 / ANIVOICE
          </span>
          <span className="hidden md:inline">DUBBING — WITHOUT LOSING THE VOICE</span>
          <span>2026 ——</span>
        </div>

        {/* Main headline */}
        <div className="relative z-10 px-6 md:px-12 pt-12 md:pt-16 pb-20 md:pb-28">
          <h1
            className="font-display font-black leading-[0.88] tracking-[-0.03em] chromatic-hover whitespace-pre-line"
            style={{ fontSize: 'clamp(48px, 11vw, 180px)' }}
          >
            <span className="block text-bone">{heroLine1}</span>
            <span className="block text-lucy">{heroLine2}</span>
          </h1>

          <p className="mt-8 md:mt-10 max-w-xl text-base md:text-lg text-bone/70 leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/studio"
              className="inline-flex items-center justify-center gap-3 bg-david text-void font-display font-bold uppercase tracking-widest text-sm px-8 py-4 border-2 border-david hover:bg-void hover:text-david transition-colors"
            >
              <span>{t('landing.ctaPrimary')}</span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-3 border-2 border-bone text-bone font-display font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-bone hover:text-void transition-colors"
            >
              <span>{t('landing.ctaSecondary')}</span>
              <span aria-hidden>▸</span>
            </Link>
          </div>
        </div>

        {/* Bottom meta strip */}
        <div className="relative z-10 px-6 md:px-12 pb-10 flex items-end justify-between gap-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em]">
          <div className="flex items-center gap-3 text-bone/60">
            <span className="block w-px h-8 bg-bone/40" />
            <span>01 / SCROLL DOWN</span>
          </div>
          <span className="text-lucy">BEFORE × AFTER ↓</span>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BEFORE / AFTER                                              */}
      {/* ============================================================ */}
      <section className="relative bg-void border-b-2 border-bone">
        <div className="px-6 md:px-12 py-10 flex items-end justify-between border-b-2 border-bone">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              02 / DEMO
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              BEFORE <span className="text-lucy">×</span> AFTER
            </h2>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-bone/20 leading-none"
            style={{ fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            比較
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative border-b-2 md:border-b-0 md:border-r-2 border-bone p-6 md:p-10 bg-void">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-black text-2xl text-bone">BEFORE</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-bone/50">
                {t('landing.videoOriginalLang')}
              </span>
            </div>
            <VideoPreviewBox
              badgeLabel={t('landing.videoOriginal')}
              badgeClass="bg-bone text-void"
              langLabel={t('landing.videoOriginalLang')}
              src={SAMPLE_VIDEO_ORIGINAL}
            />
            <span
              aria-hidden
              className="absolute right-4 bottom-2 font-jp font-black text-bone/10 text-6xl leading-none select-none"
            >
              原音
            </span>
          </div>

          <div className="relative p-6 md:p-10 bg-ink">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-black text-2xl text-david">AFTER</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-bone/50">
                {t('landing.videoDubbedLang')}
              </span>
            </div>
            <VideoPreviewBox
              badgeLabel={t('landing.videoDubbed')}
              badgeClass="bg-lucy text-void"
              langLabel={t('landing.videoDubbedLang')}
              src={SAMPLE_VIDEO_DUBBED}
            />
            <span
              aria-hidden
              className="absolute right-4 bottom-2 font-jp font-black text-lucy/20 text-6xl leading-none select-none"
            >
              吹替
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className="relative bg-ink border-b-2 border-bone px-6 md:px-12 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              03 / FEATURES
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              왜 <span className="text-david">AniVoice</span>인가
            </h2>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-david/20 leading-none"
            style={{ fontSize: 'clamp(60px, 7vw, 130px)' }}
          >
            機能
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_KEYS.map((f, i) => (
            <div key={f.titleKey} className="relative">
              <div className="absolute -top-3 left-4 z-10 bg-void border-2 border-bone px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-bone">
                {String(i + 1).padStart(2, '0')}
              </div>
              <span
                aria-hidden
                className="absolute -top-8 right-2 z-10 font-jp font-black text-bone/20 text-5xl leading-none select-none pointer-events-none"
              >
                {FEATURE_SFX[i]}
              </span>
              <FeatureCard
                icon={FEATURE_ICONS[f.iconId]}
                title={t(f.titleKey)}
                desc={t(f.descKey)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS — manga panels                                 */}
      {/* ============================================================ */}
      <section className="relative bg-void border-b-2 border-bone px-6 md:px-12 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              04 / HOW IT WORKS
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              {t('landing.howItWorks')}
            </h2>
            <p className="mt-4 max-w-xl text-bone/60 text-sm md:text-base leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-lucy/20 leading-none"
            style={{ fontSize: 'clamp(60px, 7vw, 130px)' }}
          >
            手順
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {STEP_KEYS.map((s, i) => (
            <StepCard
              key={s.titleKey}
              num={i + 1}
              title={t(s.titleKey)}
              desc={t(s.descKey)}
              icon={STEP_ICONS[s.iconId]}
              isLast={i === STEP_KEYS.length - 1}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SUPPORTED LANGUAGES                                         */}
      {/* ============================================================ */}
      <section className="relative bg-ink border-b-2 border-bone px-6 md:px-12 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              05 / LANGUAGES
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              {t('landing.supportedLangs')}
            </h2>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-wire/30 leading-none"
            style={{ fontSize: 'clamp(60px, 7vw, 130px)' }}
          >
            言語
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-0 border-2 border-bone">
          {SUPPORTED_LANGUAGES.map((lang, i) => (
            <div
              key={lang.key}
              className={`relative group bg-void px-6 py-8 flex flex-col items-start gap-3 hover:bg-lucy hover:text-void transition-colors ${
                i < SUPPORTED_LANGUAGES.length - 1 ? 'border-r-2 border-b-2 border-bone' : 'border-b-2 border-bone'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-bone/40 group-hover:text-void/70">
                {String(i + 1).padStart(2, '0')} / {lang.key.toUpperCase()}
              </span>
              <span className="text-4xl leading-none">{lang.flag}</span>
              <span className="font-display font-bold text-sm text-bone group-hover:text-void">
                {t(`languages.${lang.key}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                     */}
      {/* ============================================================ */}
      <section className="relative bg-void border-b-2 border-bone px-6 md:px-12 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              06 / PRICING
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              {t('pricing.title')}
            </h2>
            <p className="mt-4 max-w-xl text-bone/60 text-sm md:text-base leading-relaxed">
              {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
            </p>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-david/20 leading-none"
            style={{ fontSize: 'clamp(60px, 7vw, 130px)' }}
          >
            料金
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard
              key={pack.seconds}
              label={t(pack.labelKey)}
              price={pack.price}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
      {/* ============================================================ */}
      <section className="relative bg-void border-b-2 border-bone px-6 md:px-12 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60 mb-2">
              07 / FAQ
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-none text-bone">
              {t('landing.faq')}
            </h2>
          </div>
          <span
            aria-hidden
            className="hidden md:inline font-jp font-black text-lucy/20 leading-none"
            style={{ fontSize: 'clamp(60px, 7vw, 130px)' }}
          >
            質問
          </span>
        </div>

        <div className="max-w-4xl">
          {FAQ_KEYS.map((item, i) => (
            <FAQItem key={i} question={t(item.qKey)} answer={t(item.aKey)} />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA — full-bleed lucy block                                 */}
      {/* ============================================================ */}
      <section className="relative bg-lucy text-void overflow-hidden border-b-2 border-bone">
        <span
          aria-hidden
          className="absolute right-[-4vw] top-[-8vw] font-jp font-black text-void/15 leading-none select-none pointer-events-none"
          style={{ fontSize: 'clamp(240px, 36vw, 560px)' }}
        >
          吹替
        </span>

        <div className="relative z-10 px-6 md:px-12 py-24 md:py-32">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-void/70 mb-6">
            08 / START NOW
          </div>
          <h2
            className="font-display font-black leading-[0.9] tracking-[-0.03em] max-w-4xl"
            style={{ fontSize: 'clamp(44px, 9vw, 140px)' }}
          >
            목소리를 <br />
            <span className="text-void">입히다.</span>
          </h2>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              to="/studio"
              className="inline-flex items-center justify-center gap-3 bg-void text-bone font-display font-bold uppercase tracking-widest text-sm px-10 py-5 border-2 border-void hover:bg-bone hover:text-void transition-colors"
            >
              <span>{t('landing.ctaPrimary')}</span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-3 border-2 border-void text-void font-display font-bold uppercase tracking-widest text-sm px-10 py-5 hover:bg-void hover:text-bone transition-colors"
            >
              <span>{t('common.pricing')}</span>
              <span aria-hidden>▸</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <footer className="bg-void px-6 md:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
          {t('landing.copyright')}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
          ANIVOICE / 2026 / TRIGGER-EDITION
        </span>
      </footer>
    </main>
  );
}
