import { useAuth } from '../../context/AuthContext';
import { MonitorDashboard } from './MonitorDashboard';
import { UserDashboard } from './UserDashboard';

export function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'monitor' || user?.role === 'professor') {
    return <MonitorDashboard />;
  }

  return <UserDashboard />;
}
