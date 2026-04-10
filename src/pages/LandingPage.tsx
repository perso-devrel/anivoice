import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { key: 'ja', flag: '🇯🇵' },
  { key: 'ko', flag: '🇰🇷' },
  { key: 'en', flag: '🇺🇸' },
  { key: 'es', flag: '🇪🇸' },
  { key: 'pt', flag: '🇧🇷' },
  { key: 'id', flag: '🇮🇩' },
  { key: 'ar', flag: '🇸🇦' },
];

const FAQ_KEYS = [
  { qKey: 'landing.faqVoiceQ', aKey: 'landing.faqVoiceA' },
  { qKey: 'landing.faqLimitQ', aKey: 'landing.faqLimitA' },
  { qKey: 'landing.faqFormatQ', aKey: 'landing.faqFormatA' },
  { qKey: 'landing.faqEditQ', aKey: 'landing.faqEditA' },
];

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                  */
/* ------------------------------------------------------------------ */

function IconVoice() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
    </svg>
  );
}

function IconLang() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5a11.978 11.978 0 01-8.716-3.747" />
    </svg>
  );
}

function IconLipSync() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M12 15V3m0 12l-3-3m3 3l3-3" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white/80">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary-400 shrink-0">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

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

function PricingCard({
  name,
  price,
  features,
  highlight,
  selectLabel,
  popularLabel,
}: {
  name: string;
  price: string;
  features: string[];
  highlight: boolean;
  selectLabel: string;
  popularLabel?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col relative transition-transform duration-300 hover:scale-[1.03] ${
        highlight
          ? 'gradient-bg shadow-2xl shadow-primary-500/20 ring-2 ring-primary-400/50'
          : 'glass'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          {popularLabel}
        </span>
      )}
      <h3 className={`text-xl font-bold mb-1 ${highlight ? 'text-white' : 'text-white'}`}>
        {name}
      </h3>
      <p className={`text-3xl font-extrabold mb-6 ${highlight ? 'text-white' : 'gradient-text'}`}>
        {price}
      </p>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <IconCheck />
            <span className={highlight ? 'text-white/90' : 'text-gray-300'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
          highlight
            ? 'bg-white text-primary-600 hover:bg-gray-100'
            : 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10'
        }`}
      >
        {selectLabel}
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
        <IconChevron open={open} />
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

  const features = [
    { icon: <IconVoice />, titleKey: 'landing.featureVoice', descKey: 'landing.featureVoiceDesc' },
    { icon: <IconLang />, titleKey: 'landing.featureLang', descKey: 'landing.featureLangDesc' },
    { icon: <IconLipSync />, titleKey: 'landing.featureLipSync', descKey: 'landing.featureLipSyncDesc' },
    { icon: <IconEdit />, titleKey: 'landing.featureEdit', descKey: 'landing.featureEditDesc' },
  ];

  const steps = [
    { icon: <IconUpload />, titleKey: 'landing.step1', descKey: 'landing.step1Desc' },
    { icon: <IconSettings />, titleKey: 'landing.step2', descKey: 'landing.step2Desc' },
    { icon: <IconDownload />, titleKey: 'landing.step3', descKey: 'landing.step3Desc' },
  ];

  const plans = [
    { nameKey: 'pricing.free.name', priceKey: 'pricing.free.price', featuresKey: 'pricing.free.features', highlight: false },
    { nameKey: 'pricing.basic.name', priceKey: 'pricing.basic.price', featuresKey: 'pricing.basic.features', highlight: false },
    { nameKey: 'pricing.pro.name', priceKey: 'pricing.pro.price', featuresKey: 'pricing.pro.features', highlight: true },
    { nameKey: 'pricing.payPerUse.name', priceKey: 'pricing.payPerUse.price', featuresKey: 'pricing.payPerUse.features', highlight: false },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-accent-600/10 blur-[120px]" />
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

          {/* Video comparison mock */}
          <div className="max-w-4xl mx-auto animate-float">
            <div className="glass rounded-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="relative rounded-xl overflow-hidden bg-surface-900 aspect-video flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <IconPlay />
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-xs text-white px-3 py-1 rounded-full font-medium">
                    {t('landing.videoOriginal')}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-xs text-gray-300 px-3 py-1 rounded-full">
                    {t('landing.videoOriginalLang')}
                  </span>
                  {/* Waveform decoration */}
                  <div className="absolute bottom-3 left-3 flex items-end gap-0.5">
                    {[3, 5, 2, 6, 4, 7, 3, 5, 2, 4, 6, 3, 5, 7, 4].map((h, i) => (
                      <div key={i} className="w-1 bg-primary-400/60 rounded-full" style={{ height: `${h * 3}px` }} />
                    ))}
                  </div>
                </div>
                {/* Dubbed */}
                <div className="relative rounded-xl overflow-hidden bg-surface-900 aspect-video flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <IconPlay />
                  <span className="absolute top-3 left-3 gradient-bg text-xs text-white px-3 py-1 rounded-full font-medium">
                    {t('landing.videoDubbed')}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-xs text-gray-300 px-3 py-1 rounded-full">
                    {t('landing.videoDubbedLang')}
                  </span>
                  <div className="absolute bottom-3 left-3 flex items-end gap-0.5">
                    {[4, 6, 3, 7, 5, 2, 6, 4, 7, 3, 5, 2, 6, 4, 5].map((h, i) => (
                      <div key={i} className="w-1 bg-accent-400/60 rounded-full" style={{ height: `${h * 3}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FEATURES                                                    */}
        {/* ============================================================ */}
        <section className="px-4 py-20 md:py-28 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard
                key={f.titleKey}
                icon={f.icon}
                title={t(f.titleKey)}
                desc={t(f.descKey)}
              />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS                                                */}
        {/* ============================================================ */}
        <section className="px-4 py-20 md:py-28 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 gradient-text">
            {t('landing.howItWorks')}
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-lg mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((s, i) => (
              <StepCard
                key={s.titleKey}
                num={i + 1}
                title={t(s.titleKey)}
                desc={t(s.descKey)}
                icon={s.icon}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SUPPORTED LANGUAGES                                         */}
        {/* ============================================================ */}
        <section className="px-4 py-20 md:py-28 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 gradient-text">
            {t('landing.supportedLangs')}
          </h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {LANGUAGES.map((lang) => (
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
        <section className="px-4 py-20 md:py-28 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 gradient-text">
            {t('pricing.title')}
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-lg mx-auto">
            {t('pricing.subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <PricingCard
                key={plan.nameKey}
                name={t(plan.nameKey)}
                price={t(plan.priceKey)}
                features={t(plan.featuresKey, { returnObjects: true }) as string[]}
                highlight={plan.highlight}
                selectLabel={t('pricing.selectPlan')}
                popularLabel={plan.highlight ? t('landing.popular') : undefined}
              />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FAQ                                                         */}
        {/* ============================================================ */}
        <section className="px-4 py-20 md:py-28 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 gradient-text">
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
