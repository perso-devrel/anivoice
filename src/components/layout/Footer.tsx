import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FOOTER_LINK_CLASS = 'block text-sm text-ink-soft hover:text-cinnabar transition-colors';
const FOOTER_HEADING_CLASS = 'text-[11px] font-mono uppercase tracking-[0.18em] text-ink-mute mb-4';
const FOOTER_SECTION_CLASS = 'space-y-2.5';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-ink bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-baseline gap-2 mb-5">
              <span className="font-display italic text-2xl text-ink leading-none">Ani</span>
              <span className="font-display text-2xl text-ink leading-none">Voice</span>
              <span className="font-jp text-xs text-ink-mute ml-1">声</span>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
              {t('common.tagline')}
            </p>
          </div>

          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.product')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <Link to="/studio" className={FOOTER_LINK_CLASS}>{t('common.studio')}</Link>
              <Link to="/library" className={FOOTER_LINK_CLASS}>{t('common.library')}</Link>
              <Link to="/pricing" className={FOOTER_LINK_CLASS}>{t('common.pricing')}</Link>
            </div>
          </div>

          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.support')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <a href="#faq" className={FOOTER_LINK_CLASS}>{t('footer.faq')}</a>
              <a href="mailto:support@anivoice.ai" className={FOOTER_LINK_CLASS}>{t('footer.contact')}</a>
            </div>
          </div>

          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.legal')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.terms')}</a>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.privacy')}</a>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.dmca')}</a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-ink/15 flex flex-col sm:flex-row sm:justify-between gap-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-mute">
            {t('landing.copyright')}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-mute">
            {t('footer.allRights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
