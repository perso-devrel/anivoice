import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { ChevronDownIcon, PlayIcon } from '../components/icons';
import { SUPPORTED_LANGUAGES } from '../constants';
import { CREDIT_PRICE_PER_MINUTE_USD, TIME_PACK_10_MIN_SECONDS, TIME_PACK_50_MIN_SECONDS, TIME_PACK_100_MIN_SECONDS, TIME_PACK_10_MIN_PRICE, TIME_PACK_50_MIN_PRICE, TIME_PACK_100_MIN_PRICE } from '../utils/pricing';

const FAQ_KEYS = [
  { qKey: 'landing.faqVoiceQ', aKey: 'landing.faqVoiceA' },
  { qKey: 'landing.faqLimitQ', aKey: 'landing.faqLimitA' },
  { qKey: 'landing.faqFormatQ', aKey: 'landing.faqFormatA' },
  { qKey: 'landing.faqEditQ', aKey: 'landing.faqEditA' },
];

const FEATURE_KEYS = [
  { titleKey: 'landing.featureVoice', descKey: 'landing.featureVoiceDesc' },
  { titleKey: 'landing.featureLang', descKey: 'landing.featureLangDesc' },
  { titleKey: 'landing.featureLipSync', descKey: 'landing.featureLipSyncDesc' },
  { titleKey: 'landing.featureEdit', descKey: 'landing.featureEditDesc' },
] as const;

const STEP_KEYS = [
  { titleKey: 'landing.step1', descKey: 'landing.step1Desc' },
  { titleKey: 'landing.step2', descKey: 'landing.step2Desc' },
  { titleKey: 'landing.step3', descKey: 'landing.step3Desc' },
] as const;

const CREDIT_PACKS = [
  { seconds: TIME_PACK_10_MIN_SECONDS, labelKey: 'pricing.timePack10', price: TIME_PACK_10_MIN_PRICE },
  { seconds: TIME_PACK_50_MIN_SECONDS, labelKey: 'pricing.timePack50', price: TIME_PACK_50_MIN_PRICE },
  { seconds: TIME_PACK_100_MIN_SECONDS, labelKey: 'pricing.timePack100', price: TIME_PACK_100_MIN_PRICE },
];

const SAMPLE_VIDEO_ORIGINAL = '/sample_original_ja.mp4';
const SAMPLE_VIDEO_DUBBED = '/sample_dubbed_en.mp4';

const SECTION = 'px-5 sm:px-8 lg:px-12 mx-auto';
const SECTION_LABEL = 'font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute';
const SECTION_HEADING = 'font-display text-3xl md:text-5xl text-ink leading-[1.1] tracking-tight';

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function VideoPreviewBox({
  badgeLabel,
  langLabel,
  src,
  accent,
}: {
  badgeLabel: string;
  langLabel: string;
  src: string;
  accent?: boolean;
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
    <figure className="group">
      <div
        className="relative aspect-video overflow-hidden bg-ink cursor-pointer"
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
          <div className="absolute inset-0 bg-ink/30 flex items-center justify-center transition-opacity">
            <div className="w-14 h-14 border border-cream/80 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-cream ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3 border-t border-ink/15 pt-2">
        <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${accent ? 'text-cinnabar' : 'text-ink-mute'}`}>
          {badgeLabel}
        </span>
        <span className="font-mono text-[11px] tracking-wider text-ink-soft">
          {langLabel}
        </span>
      </figcaption>
    </figure>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ink/15">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-baseline justify-between gap-6 py-6 text-left group"
      >
        <span className="font-display text-lg md:text-xl text-ink group-hover:text-cinnabar transition-colors">
          {question}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-ink-soft shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-60 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-ink-soft leading-relaxed max-w-2xl">{answer}</p>
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

  return (
    <main className="min-h-screen bg-cream text-ink overflow-x-hidden">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className={`${SECTION} max-w-7xl pt-16 md:pt-28 pb-20 md:pb-32`}>
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline md:items-start gap-3 md:gap-2">
            <span className={SECTION_LABEL}>第 01 章</span>
            <span className="hidden md:block w-10 h-px bg-ink/40 mt-1" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Anime · Dubbing
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h1 className="font-display text-[2.6rem] sm:text-6xl md:text-[5.5rem] leading-[0.98] tracking-tight text-ink whitespace-pre-line">
              {t('landing.heroTitle')}
            </h1>
            <p className="mt-10 max-w-xl text-lg text-ink-soft leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                to="/studio"
                className="group inline-flex items-baseline gap-3 bg-ink text-cream px-7 py-3.5 font-mono text-[13px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors"
              >
                {t('landing.ctaPrimary')}
                <span className="translate-y-[1px] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/signup"
                className="font-mono text-[13px] uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-cinnabar hover:border-cinnabar transition-colors"
              >
                {t('landing.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>

        {/* Video comparison */}
        <div className="border-t border-ink pt-10">
          <div className="flex items-baseline justify-between mb-6">
            <span className={SECTION_LABEL}>Reel — Original ⇌ Dubbed</span>
            <span className="font-mono text-[11px] tracking-widest text-ink-mute hidden md:inline">
              00:00 / 00:08
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <VideoPreviewBox
              badgeLabel={t('landing.videoOriginal')}
              langLabel={t('landing.videoOriginalLang')}
              src={SAMPLE_VIDEO_ORIGINAL}
            />
            <VideoPreviewBox
              badgeLabel={t('landing.videoDubbed')}
              langLabel={t('landing.videoDubbedLang')}
              src={SAMPLE_VIDEO_DUBBED}
              accent
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section className={`${SECTION} max-w-7xl py-24 md:py-32 border-t border-ink`}>
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-3">
            <span className={SECTION_LABEL}>第 02 章</span>
            <h2 className={`${SECTION_HEADING} mt-3`}>
              {t('landing.featuresHeading') !== 'landing.featuresHeading'
                ? t('landing.featuresHeading')
                : t('landing.featureVoice')}
            </h2>
          </div>
          <div className="hidden md:flex md:col-span-9 items-end">
            <p className="text-ink-soft leading-relaxed max-w-md">
              {t('landing.heroSubtitle')}
            </p>
          </div>
        </div>
        <ol className="border-t border-ink/40">
          {FEATURE_KEYS.map((f, i) => (
            <li
              key={f.titleKey}
              className="grid grid-cols-12 gap-6 border-b border-ink/15 py-8 md:py-10 group hover:bg-paper/40 transition-colors"
            >
              <div className="col-span-2 md:col-span-1">
                <span className="font-mono text-sm text-cinnabar tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="col-span-10 md:col-span-4">
                <h3 className="font-display text-2xl md:text-3xl text-ink leading-tight">
                  {t(f.titleKey)}
                </h3>
              </div>
              <div className="col-span-12 md:col-span-7">
                <p className="text-ink-soft leading-relaxed">
                  {t(f.descKey)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section className={`${SECTION} max-w-7xl py-24 md:py-32 border-t border-ink`}>
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3">
            <span className={SECTION_LABEL}>第 03 章</span>
            <h2 className={`${SECTION_HEADING} mt-3`}>{t('landing.howItWorks')}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {STEP_KEYS.map((s, i) => (
            <div key={s.titleKey} className="border-t border-ink pt-6">
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display text-5xl md:text-6xl text-ink leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl text-ink mb-3">
                {t(s.titleKey)}
              </h3>
              <p className="text-ink-soft leading-relaxed text-[15px]">
                {t(s.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SUPPORTED LANGUAGES                                         */}
      {/* ============================================================ */}
      <section className={`${SECTION} max-w-7xl py-24 md:py-32 border-t border-ink`}>
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3">
            <span className={SECTION_LABEL}>第 04 章</span>
            <h2 className={`${SECTION_HEADING} mt-3`}>
              {t('landing.supportedLangs')}
            </h2>
          </div>
        </div>
        <div className="border-t border-ink/40 divide-y divide-ink/15">
          {SUPPORTED_LANGUAGES.map((lang, i) => (
            <div
              key={lang.key}
              className="grid grid-cols-12 gap-6 py-5 items-baseline group hover:text-cinnabar transition-colors"
            >
              <div className="col-span-2 md:col-span-1">
                <span className="font-mono text-xs text-ink-mute tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 text-2xl">{lang.flag}</div>
              <div className="col-span-8 md:col-span-7">
                <span className="font-display text-2xl md:text-3xl text-ink group-hover:text-cinnabar transition-colors">
                  {t(`languages.${lang.key}`)}
                </span>
              </div>
              <div className="col-span-12 md:col-span-3 text-right md:text-left">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
                  {lang.key}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                     */}
      {/* ============================================================ */}
      <section className={`${SECTION} max-w-7xl py-24 md:py-32 border-t border-ink`}>
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-3">
            <span className={SECTION_LABEL}>第 05 章</span>
            <h2 className={`${SECTION_HEADING} mt-3`}>{t('pricing.title')}</h2>
          </div>
          <div className="hidden md:flex md:col-span-9 items-end">
            <p className="text-ink-soft leading-relaxed max-w-md">
              {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-ink border-l border-ink/15">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.seconds}
              className="border-r border-b border-ink/15 px-8 py-12 flex flex-col"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-6">
                {t(pack.labelKey)}
              </span>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-6xl md:text-7xl text-ink leading-none">
                  ${pack.price}
                </span>
              </div>
              <Link
                to="/pricing"
                className="mt-auto inline-flex items-baseline gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 self-start hover:text-cinnabar hover:border-cinnabar transition-colors"
              >
                {t('pricing.purchase') !== 'pricing.purchase' ? t('pricing.purchase') : 'Purchase'}
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
      {/* ============================================================ */}
      <section id="faq" className={`${SECTION} max-w-7xl py-24 md:py-32 border-t border-ink`}>
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-3">
            <span className={SECTION_LABEL}>第 06 章</span>
            <h2 className={`${SECTION_HEADING} mt-3`}>{t('landing.faq')}</h2>
          </div>
          <div className="col-span-12 md:col-span-9 border-t border-ink/40">
            {FAQ_KEYS.map((item, i) => (
              <FAQItem key={i} question={t(item.qKey)} answer={t(item.aKey)} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing mark */}
      <div className="border-t border-ink">
        <div className={`${SECTION} max-w-7xl py-12 flex items-baseline justify-between`}>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            — Fin —
          </span>
          <span className="font-jp text-sm text-ink-mute">声を、世界へ。</span>
        </div>
      </div>
    </main>
  );
}
