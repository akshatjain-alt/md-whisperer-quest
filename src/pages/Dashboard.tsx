import { useAuth } from '@/contexts/AuthContext';
import AgentDashboard from './AgentDashboard';
import AdminDashboardNew from './AdminDashboardNew';
import ManagerDashboard from './ManagerDashboard';
import ExpertDashboard from './ExpertDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  // Agent gets simple dashboard
  if (user?.role === 'agent') {
    return <AgentDashboard />;
  }

  // Manager gets dashboard
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  // Admin gets analytics dashboard
  if (user?.role === 'admin') {
    return <AdminDashboardNew />;
  }

  // Expert and Viewer get real data dashboard with bento boxes
  return <ExpertDashboard />;
}