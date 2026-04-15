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

const LANDING_SECTION_CLASS = "px-4 py-20 md:py-28 mx-auto";
const SECTION_HEADING_CLASS = "text-3xl md:text-4xl font-bold text-center gradient-text";

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
      className="relative rounded-xl overflow-hidden bg-surface-900 aspect-video group cursor-pointer"
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
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <PlayIcon className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>
      )}
      <span className={`absolute top-3 left-3 ${badgeClass} text-xs text-white px-3 py-1 rounded-full font-medium`}>
        {badgeLabel}
      </span>
      <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-xs text-gray-300 px-3 py-1 rounded-full">
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
    <div className="glass rounded-2xl p-6 hover:scale-[1.03] transition-transform duration-300 group">
      <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-4 text-white group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-shadow">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
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
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connecting line (hidden on last item and on mobile) */}
      {!isLast && (
        <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary-500 to-accent-500 opacity-30" />
      )}
      <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg mb-4 relative z-10 shadow-lg shadow-primary-500/20">
        {num}
      </div>
      <div className="text-primary-400 mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{desc}</p>
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
    <div className="glass rounded-2xl p-6 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
        <ClockIcon className="w-6 h-6 text-primary-400" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{label}</p>
      <p className="text-3xl font-bold gradient-text mb-6">${price}</p>
      <Link
        to="/pricing"
        className="mt-auto w-full text-center py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors"
      >
        {label}
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-surface-700/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-white font-medium pr-4 group-hover:text-primary-400 transition-colors">
          {question}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
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
    <main className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/8 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-accent-600/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section className="px-4 pt-24 pb-20 md:pt-36 md:pb-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 whitespace-pre-line gradient-text">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/studio"
                className="gradient-bg text-white font-semibold py-3.5 px-8 rounded-xl text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
              >
                {t('landing.ctaPrimary')}
              </Link>
              <Link
                to="/signup"
                className="border border-surface-700 text-gray-300 font-semibold py-3.5 px-8 rounded-xl text-base hover:border-primary-500/50 hover:text-white transition-all"
              >
                {t('landing.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Video comparison */}
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VideoPreviewBox
                  badgeLabel={t('landing.videoOriginal')}
                  badgeClass="bg-black/60 backdrop-blur-sm"
                  langLabel={t('landing.videoOriginalLang')}
                  src={SAMPLE_VIDEO_ORIGINAL}
                />
                <VideoPreviewBox
                  badgeLabel={t('landing.videoDubbed')}
                  badgeClass="gradient-bg"
                  langLabel={t('landing.videoDubbedLang')}
                  src={SAMPLE_VIDEO_DUBBED}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FEATURES                                                    */}
        {/* ============================================================ */}
        <section className={`${LANDING_SECTION_CLASS} max-w-6xl`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_KEYS.map((f) => (
              <FeatureCard
                key={f.titleKey}
                icon={FEATURE_ICONS[f.iconId]}
                title={t(f.titleKey)}
                desc={t(f.descKey)}
              />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS                                                */}
        {/* ============================================================ */}
        <section className={`${LANDING_SECTION_CLASS} max-w-5xl`}>
          <h2 className={`${SECTION_HEADING_CLASS} mb-4`}>
            {t('landing.howItWorks')}
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-lg mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
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
        <section className={`${LANDING_SECTION_CLASS} max-w-5xl`}>
          <h2 className={`${SECTION_HEADING_CLASS} mb-14`}>
            {t('landing.supportedLangs')}
          </h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.key}
                className="glass rounded-2xl px-6 py-5 flex flex-col items-center gap-3 min-w-[100px] hover:scale-105 transition-transform duration-200"
              >
                <span className="text-4xl">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-300">
                  {t(`languages.${lang.key}`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PRICING                                                     */}
        {/* ============================================================ */}
        <section className={`${LANDING_SECTION_CLASS} max-w-4xl`}>
          <h2 className={`${SECTION_HEADING_CLASS} mb-4`}>
            {t('pricing.title')}
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-lg mx-auto">
            {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
          </p>
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
        <section className={`${LANDING_SECTION_CLASS} max-w-3xl`}>
          <h2 className={`${SECTION_HEADING_CLASS} mb-14`}>
            {t('landing.faq')}
          </h2>
          <div className="glass rounded-2xl p-6 md:p-8">
            {FAQ_KEYS.map((item, i) => (
              <FAQItem key={i} question={t(item.qKey)} answer={t(item.aKey)} />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <footer className="px-4 py-10 text-center">
          <p className="text-gray-500 text-sm">{t('landing.copyright')}</p>
        </footer>
      </div>
    </main>
  );
}
