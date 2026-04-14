import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoSrc from '../../assets/logoname.png';
import { Footer } from '../../components/Footer';
import '../Login/Login.css';

export function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setFeedback({ message: 'Preencha um formato de e-mail válido.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setFeedback({ message: res.data.message, type: 'success' });
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.error || 'Erro ao conectar com o serviço. Tente novamente mais tarde.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" id="esqueci-senha-page">
      <div className="login-page__content">
        <div className="login-page__logo-wrapper">
          <img src={logoSrc} alt="Quiz Direito" className="login-page__logo" />
        </div>

        <div className="login-page__card" style={{ padding: '40px 30px' }}>
          <h1 className="login-page__title">Recuperar Senha</h1>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: '#666', fontSize: '14px' }}>
            Digite o e-mail associado à sua conta e enviaremos instruções para redefinir sua senha.
          </p>

          {feedback && (
            <div
              className={`login-page__error`}
              style={{ backgroundColor: feedback.type === 'success' ? '#e8f5e9' : '#ffebee', color: feedback.type === 'success' ? '#2e7d32' : '#c62828' }}
            >
              {feedback.message}
            </div>
          )}

          {!feedback || feedback.type === 'error' ? (
            <form className="login-page__form" onSubmit={handleSubmit}>
              <div className="login-page__field">
                <label htmlFor="recovery-email" className="login-page__label">
                  E-mail
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  className="login-page__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado"
                />
              </div>

              <button type="submit" className="login-page__btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          ) : null}

          <div className="login-page__links" style={{ marginTop: '24px', justifyContent: 'center' }}>
            <Link to="/" className="login-page__link">
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
