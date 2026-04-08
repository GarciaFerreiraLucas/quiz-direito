import { useAuth } from '../../context/AuthContext';
import { MonitorDashboard } from './MonitorDashboard';
import '../Quizzes/Quizzes.css';

export function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'monitor' || user?.role === 'professor') {
    return <MonitorDashboard />;
  }

  return (
    <section className="page-placeholder" id="dashboard-page">
      <h2>Início</h2>
      <p>Bem-vindo! Conteúdo do Início em breve.</p>
    </section>
  );
}
