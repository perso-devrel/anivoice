import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '../Toast';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-ink focus:text-cream focus:text-sm focus:font-medium focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>
      <ScrollToTop />
      <Navbar />
      <ToastContainer />
      <main id="main-content" className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
