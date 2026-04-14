import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoUniversidade from '../../assets/logo-universidade.png';
import iconeInicio from '../../assets/icones/icone_inicio.svg';
import iconeQuiz from '../../assets/icones/icone_quiz.svg';
import iconeInformativos from '../../assets/icones/icone_informativos.svg';
import iconePerfil from '../../assets/icones/icone_perfil.svg';
import iconeSair from '../../assets/icones/icone_sair.svg';
import iconeCategoria from '../../assets/icones/icone_categoria.svg';
import iconeTag from '../../assets/icones/icone_tag.svg';
import iconeMonitores from '../../assets/icones/icone_monitores.svg';
import './Sidebar.css';

interface MenuItem {
  label: string;
  to: string;
  icon: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { logout, user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  // Base items for all users
  const menuItems: MenuItem[] = [
    { label: 'Início', to: '/dashboard', icon: iconeInicio },
    { label: 'Quizzes', to: '/dashboard/quizzes', icon: iconeQuiz },
    { label: 'Informativos', to: '/dashboard/informativos', icon: iconeInformativos },
  ];

  // Histórico for authenticated users (not guests)
  if (!isGuest) {
    menuItems.push({ label: 'Histórico', to: '/dashboard/historico', icon: iconeQuiz });
  }

  // Specific items for monitor/professor
  if (user?.role === 'monitor' || user?.role === 'professor') {
    menuItems.push(
      { label: 'Categorias', to: '/dashboard/categorias', icon: iconeCategoria },
      { label: 'Tags', to: '/dashboard/tags', icon: iconeTag },
      { label: 'Monitores', to: '/dashboard/monitores', icon: iconeMonitores }
    );
  }

  // End items for all users
  if (!isGuest) {
    menuItems.push({ label: 'Perfil', to: '/dashboard/perfil', icon: iconePerfil });
  }

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirm(false);
    if (onClose) onClose();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar__overlay${isOpen ? ' sidebar__overlay--visible' : ''}`}
        onClick={onClose}
      />

      <aside
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        id="sidebar"
      >
        {/* Logo area */}
        <div className="sidebar__logo-area">
          <img
            src={logoUniversidade}
            alt="UniRV"
            className="sidebar__logo-img"
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <img src={item.icon} alt={item.label} className="sidebar__link-icon-img" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Sair Button */}
          <button className="sidebar__link" onClick={handleLogoutClick} id="btn-sair">
            <img src={iconeSair} alt="Sair" className="sidebar__link-icon-img" />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="sidebar__modal-overlay">
          <div className="sidebar__modal">
            <h3 className="sidebar__modal-title">Confirmar Saída</h3>
            <p className="sidebar__modal-text">Deseja realmente sair do sistema?</p>
            <div className="sidebar__modal-actions">
              <button 
                className="sidebar__modal-btn sidebar__modal-btn--cancel" 
                onClick={cancelLogout}
              >
                Cancelar
              </button>
              <button 
                className="sidebar__modal-btn sidebar__modal-btn--confirm" 
                onClick={confirmLogout}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
