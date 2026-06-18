import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer__content">
        <span>© {currentYear} Quiz Jurídico</span>
        <span className="footer__separator">•</span>
        <a href="#footer" onClick={(e) => { e.preventDefault(); alert('A página de Política de Privacidade e Termos de Uso estará disponível na próxima versão.'); }} className="footer__link">Privacidade</a>
        <span className="footer__separator">•</span>
        <a href="#footer" onClick={(e) => { e.preventDefault(); alert('Para suporte ou dúvidas, entre em contato através do e-mail: suporte@quizjuridico.com.br'); }} className="footer__link">Contato</a>
      </div>
    </footer>
  );
}
