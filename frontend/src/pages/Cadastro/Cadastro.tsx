import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Footer } from '../../components/Footer';
import logoSrc from '../../assets/logoname.png';
import './Cadastro.css';

export function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (senha !== confirmarSenha) {
      setFeedback({ message: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', { nome, email, senha, confirmarSenha });
      setFeedback({ message: res.data.message, type: 'success' });
      
      // Auto-redirect to login after short delay
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.error || 'Não foi possível efetuar o cadastro.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cadastro-page" id="cadastro-page">
      {/* Content area (logo + card) */}
      <div className="cadastro-page__content">
        {/* Logo */}
        <div className="cadastro-page__logo-wrapper">
          <img
            src={logoSrc}
            alt="UniRV - Universidade de Rio Verde"
            className="cadastro-page__logo"
          />
        </div>

        {/* Card de Cadastro */}
        <div className="cadastro-page__card">
          <h1 className="cadastro-page__title">Fazer Cadastro</h1>

          {feedback && (
            <div
              className={`login-page__error`}
              style={{ backgroundColor: feedback.type === 'success' ? '#e8f5e9' : '#ffebee', color: feedback.type === 'success' ? '#2e7d32' : '#c62828', marginBottom: '16px' }}
            >
              {feedback.message}
            </div>
          )}

          <form className="cadastro-page__form" onSubmit={handleSubmit}>
            {/* Nome */}
            <div className="cadastro-page__field">
              <label htmlFor="cadastro-nome" className="cadastro-page__label">
                Nome
              </label>
              <input
                id="cadastro-nome"
                type="text"
                className="cadastro-page__input"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* E-mail */}
            <div className="cadastro-page__field">
              <label htmlFor="cadastro-email" className="cadastro-page__label">
                E-mail
              </label>
              <input
                id="cadastro-email"
                type="email"
                className="cadastro-page__input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="cadastro-page__field">
              <label htmlFor="cadastro-senha" className="cadastro-page__label">
                Senha
              </label>
              <input
                id="cadastro-senha"
                type="password"
                className="cadastro-page__input"
                placeholder="Senha *"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Confirmar Senha */}
            <div className="cadastro-page__field">
              <label htmlFor="cadastro-confirmar-senha" className="cadastro-page__label">
                Confirmar Senha
              </label>
              <input
                id="cadastro-confirmar-senha"
                type="password"
                className="cadastro-page__input"
                placeholder="Senha *"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Botão Cadastrar */}
            <button type="submit" className="cadastro-page__btn-primary" id="btn-cadastrar" disabled={loading}>
              {loading ? 'Processando...' : 'Cadastrar'}
            </button>
          </form>

          {/* Link para Login */}
          <p className="cadastro-page__login-link">
            Já tem cadastro?{' '}
            <Link to="/" className="cadastro-page__link">Fazer login</Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
