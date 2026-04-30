import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/icons';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { initAuthListener } from './services/firebase';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const LibraryDetailPage = lazy(() => import('./pages/LibraryDetailPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function needsEmailVerification(user: { emailVerified?: boolean; providerId?: string } | null) {
  if (!user) return false;
  // Google/OAuth users come pre-verified; only password users get gated.
  const isPassword = !user.providerId || user.providerId === 'password';
  return isPassword && user.emailVerified === false;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsEmailVerification(user) && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const language = useUIStore((s) => s.language);

  useEffect(() => {
    initAuthListener();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <ErrorBoundary>
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-void">
          <LoadingSpinner />
        </div>
      }
    >
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute>
              <VerifyEmailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/archive" element={<LibraryPage />} />
        <Route path="/archive/:id" element={<LibraryDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
