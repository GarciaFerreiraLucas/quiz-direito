import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer__content">
        <span>© {currentYear} Quiz Jurídico</span>
        <span className="footer__separator">•</span>
        <a href="#" className="footer__link">Privacidade</a>
        <span className="footer__separator">•</span>
        <a href="#" className="footer__link">Contato</a>
      </div>
    </footer>
  );
}
