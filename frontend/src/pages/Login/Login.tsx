import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Footer } from '../../components/Footer';
import logoSrc from '../../assets/logoname.png';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    const success = login(email.trim(), senha);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleGuestAccess = () => {
    setError('');
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <main className="login-page" id="login-page">
      <div className="login-page__content">
        <div className="login-page__logo-wrapper">
          <img
            src={logoSrc}
            alt="UniRV - Universidade de Rio Verde"
            className="login-page__logo"
          />
        </div>

        <div className="login-page__card">
          <h1 className="login-page__title">Fazer Login</h1>

          {error && (
            <div className="login-page__error" id="login-error">
              {error}
            </div>
          )}

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="login-page__field">
              <label htmlFor="login-email" className="login-page__label">
                Usuário
              </label>
              <input
                id="login-email"
                type="text"
                className="login-page__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-page__field">
              <label htmlFor="login-senha" className="login-page__label">
                Senha
              </label>
              <input
                id="login-senha"
                type="password"
                className="login-page__input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-page__btn-primary" id="btn-login">
              Entrar
            </button>
          </form>

          <div className="login-page__links">
            <a href="#" className="login-page__link">Esqueci a senha</a>
            <Link to="/cadastro" className="login-page__link">Criar conta</Link>
          </div>

          <div className="login-page__divider">
            <span className="login-page__divider-line" />
            <span className="login-page__divider-text">OU</span>
            <span className="login-page__divider-line" />
          </div>

          <button
            type="button"
            className="login-page__btn-guest"
            id="btn-guest"
            onClick={handleGuestAccess}
          >
            Acessar como Convidado
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
