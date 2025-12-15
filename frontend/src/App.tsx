import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorNotificationProvider } from './contexts/ErrorNotificationContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { PoliciesPage } from '@/pages/PoliciesPage';
import { PolicyDetailPage } from '@/pages/PolicyDetailPage';
import { PolicyVersionPage } from '@/pages/PolicyVersionPage';
import { CustomPolicyGuidePage } from '@/pages/CustomPolicyGuidePage';
import { AboutPage } from '@/pages/AboutPage';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorNotificationProvider>
          <AppDataProvider>
            <Router>
              <AppLayout>
                <Routes>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.POLICIES} element={<PoliciesPage />} />
                  <Route path={ROUTES.POLICY_DETAIL} element={<PolicyDetailPage />} />
                  <Route path={ROUTES.POLICY_VERSION} element={<PolicyVersionPage />} />
                  <Route path={ROUTES.CUSTOM_POLICY_GUIDE} element={<CustomPolicyGuidePage />} />
                  <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                </Routes>
              </AppLayout>
            </Router>
          </AppDataProvider>
        </ErrorNotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
