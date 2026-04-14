import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="not-found" id="not-found-page">
      <span className="not-found__code">404</span>
      <h1 className="not-found__title">Página não encontrada</h1>
      <p className="not-found__text">
        A página que você está procurando não existe ou foi movida.
      </p>
      <button className="not-found__btn" onClick={() => navigate('/dashboard')}>
        Voltar ao Início
      </button>
    </section>
  );
}
