import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/PpmContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectWorkspacePage from '@/pages/ProjectWorkspacePage';
import ProjectIntakePage from '@/pages/ProjectIntakePage';
import PortfolioPage from '@/pages/PortfolioPage';
import AgilePage from '@/pages/AgilePage';
import ReportsPage from '@/pages/ReportsPage';
import GoalsPage from '@/pages/GoalsPage';
import TeamAndResourcesPage from '@/pages/TeamAndResourcesPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/app" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/app" /> : <RegisterPage />} />
      <Route path="/app" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
        <Route path="intake" element={<ProjectIntakePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="agile" element={<AgilePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="team" element={<TeamAndResourcesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
