import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import logoSrc from '../../assets/logoname.png';
import { Footer } from '../../components/Footer';
import '../Login/Login.css';

export function RedefinirSenha() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (!token) {
      setFeedback({ message: 'Nenhum token de recuperação encontrado.', type: 'error' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!password || !confirmPassword) {
      setFeedback({ message: 'Preencha todos os campos.', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ message: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    if (password.length < 8) {
      setFeedback({ message: 'A nova senha deve ter no mínimo 8 caracteres.', type: 'error' });
      return;
    }

    if (!token) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      setFeedback({ message: res.data.message, type: 'success' });
      // Redirect after success
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.error || 'Erro ao conectar no servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" id="redefinir-senha-page">
      <div className="login-page__content">
        <div className="login-page__logo-wrapper">
          <img src={logoSrc} alt="Quiz Direito" className="login-page__logo" />
        </div>

        <div className="login-page__card" style={{ padding: '40px 30px' }}>
          <h1 className="login-page__title">Criar Nova Senha</h1>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: '#666', fontSize: '14px' }}>
            Digite abaixo a sua nova senha de acesso.
          </p>

          {feedback && (
            <div
              className={`login-page__error`}
              style={{ backgroundColor: feedback.type === 'success' ? '#e8f5e9' : '#ffebee', color: feedback.type === 'success' ? '#2e7d32' : '#c62828' }}
            >
              {feedback.message}
            </div>
          )}

          {token && (!feedback || feedback.type === 'error') ? (
            <form className="login-page__form" onSubmit={handleSubmit}>
              <div className="login-page__field">
                <label htmlFor="reset-password" className="login-page__label">
                  Nova Senha
                </label>
                <input
                  id="reset-password"
                  type="password"
                  className="login-page__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                />
              </div>

              <div className="login-page__field">
                <label htmlFor="reset-confirm" className="login-page__label">
                  Confirme a Nova Senha
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  className="login-page__input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua nova senha"
                />
              </div>

              <button type="submit" className="login-page__btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Redefinir Senha'}
              </button>
            </form>
          ) : null}

          {(!token || feedback?.type === 'success') && (
            <div className="login-page__links" style={{ marginTop: '24px', justifyContent: 'center' }}>
              <Link to="/" className="login-page__link">
                Voltar ao Login
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
