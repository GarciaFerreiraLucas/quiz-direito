import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import './DashboardLayout.css';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Início',
  '/dashboard/quizzes': 'Quizzes',
  '/dashboard/informativos': 'Informativos',
  '/dashboard/perfil': 'Perfil',
  '/dashboard/categorias': 'Categorias',
  '/dashboard/tags': 'Tags',
  '/dashboard/monitores': 'Monitores',
};

function getTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.includes('/perguntas')) return 'Perguntas';
  if (pathname.startsWith('/dashboard/informativos')) return 'Informativos';
  if (pathname.startsWith('/dashboard/quizzes')) return 'Quizzes';
  if (pathname.startsWith('/dashboard/categorias')) return 'Categorias';
  if (pathname.startsWith('/dashboard/tags')) return 'Tags';
  return 'Início';
}

export function DashboardLayout() {
  const location = useLocation();
  const title = getTitle(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout" id="dashboard-layout">
      <Header title={title} onToggleSidebar={toggleSidebar} />

      <div className="dashboard-layout__body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="dashboard-layout__main" id="main-content">
          <Outlet />
        </main>
      </div>

      <div className="dashboard-layout__footer">
        <Footer />
      </div>
    </div>
  );
}
