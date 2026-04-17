import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { DEFAULT_ROUTE_BY_ROLE } from '@/config/navigation';
import type { UserRole } from '@/types/auth';

export default function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role as UserRole) || 'viewer';
  return <Navigate to={DEFAULT_ROUTE_BY_ROLE[role]} replace />;
}
