import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Product</h4>
            <div className="space-y-2">
              <Link to="/studio" className="block text-sm text-gray-500 hover:text-gray-300">{t('common.studio')}</Link>
              <Link to="/library" className="block text-sm text-gray-500 hover:text-gray-300">{t('common.library')}</Link>
              <Link to="/pricing" className="block text-sm text-gray-500 hover:text-gray-300">{t('common.pricing')}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Support</h4>
            <div className="space-y-2">
              <a href="#faq" className="block text-sm text-gray-500 hover:text-gray-300">FAQ</a>
              <a href="mailto:support@anivoice.ai" className="block text-sm text-gray-500 hover:text-gray-300">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-500 hover:text-gray-300">Terms of Service</a>
              <a href="#" className="block text-sm text-gray-500 hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="block text-sm text-gray-500 hover:text-gray-300">DMCA</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-800 text-center">
          <p className="text-xs text-gray-600">
            {t('landing.copyright')}
          </p>
          <p className="text-xs text-gray-700 mt-2">
            &copy; 2026 AniVoice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
