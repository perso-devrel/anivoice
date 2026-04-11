import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FOOTER_LINK_CLASS = 'block text-sm text-gray-500 hover:text-gray-300';
const FOOTER_HEADING_CLASS = 'text-sm font-semibold text-gray-300 mb-3';
const FOOTER_SECTION_CLASS = 'space-y-2';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-lg font-bold gradient-text">AniVoice</span>
            </div>
            <p className="text-sm text-gray-500">
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

        <div className="mt-8 pt-8 border-t border-surface-800 text-center">
          <p className="text-xs text-gray-600">
            {t('landing.copyright')}
          </p>
          <p className="text-xs text-gray-700 mt-2">
            {t('footer.allRights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
