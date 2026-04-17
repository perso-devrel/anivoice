import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FOOTER_LINK_CLASS = 'block font-mono text-xs uppercase tracking-[0.1em] text-bone/50 hover:text-bone transition-colors';
const FOOTER_HEADING_CLASS = 'font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80 mb-4';
const FOOTER_SECTION_CLASS = 'space-y-3';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t-2 border-bone bg-ink">
      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9 overflow-hidden">
                <div className="absolute inset-0 bg-lucy" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                <div className="absolute inset-0 bg-david" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                <span className="absolute inset-0 flex items-center justify-center font-display font-black text-sm text-void">
                  A
                </span>
              </div>
              <span className="font-display font-bold text-lg text-bone">AniVoice</span>
            </div>
            <p className="text-sm text-bone/50 leading-relaxed max-w-xs">
              {t('common.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.product')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <Link to="/studio" className={FOOTER_LINK_CLASS}>{t('common.studio')}</Link>
              <Link to="/library" className={FOOTER_LINK_CLASS}>{t('common.library')}</Link>
              <Link to="/pricing" className={FOOTER_LINK_CLASS}>{t('common.pricing')}</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.support')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <a href="#faq" className={FOOTER_LINK_CLASS}>{t('footer.faq')}</a>
              <a href="mailto:support@anivoice.ai" className={FOOTER_LINK_CLASS}>{t('footer.contact')}</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className={FOOTER_HEADING_CLASS}>{t('footer.legal')}</h4>
            <div className={FOOTER_SECTION_CLASS}>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.terms')}</a>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.privacy')}</a>
              <a href="#" className={FOOTER_LINK_CLASS}>{t('footer.dmca')}</a>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-8 border-t-2 border-bone/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
            {t('landing.copyright')}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30">
            {t('footer.allRights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
