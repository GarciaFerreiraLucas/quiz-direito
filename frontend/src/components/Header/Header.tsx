import logoUniversidade from '../../assets/logocombrasao.png';
import logoDireito from '../../assets/logo-direito.png';
import './Header.css';

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
}

export function Header({ title = 'Início', onToggleSidebar }: HeaderProps) {
  return (
    <header className="header" id="header">
      {/* Hamburger - mobile only */}
      <button
        className="header__hamburger"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
        id="btn-hamburger"
      >
        <span className="header__hamburger-line" />
        <span className="header__hamburger-line" />
        <span className="header__hamburger-line" />
      </button>

      <span className="header__brand">Quizz App</span>

      {/* Desktop: single title centered */}
      <span className="header__title">{title}</span>

      {/* Mobile: two-line centered title */}
      <div className="header__mobile-title">
        <span className="header__mobile-title-main">Quiz Jurídico</span>
        <span className="header__mobile-title-sub">{title}</span>
      </div>

      <div className="header__logos">
        <div className="header__logo-circle">
          <img src={logoUniversidade} alt="UniRV" />
        </div>
        <div className="header__logo-circle">
          <img src={logoDireito} alt="Direito" />
        </div>
      </div>
    </header>
  );
}
