import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import logoSrc from '../../assets/logoname.png';
import './Cadastro.css';

export function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrar com backend
    console.log('Cadastro:', { nome, email, senha, confirmarSenha });
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
            <button type="submit" className="cadastro-page__btn-primary" id="btn-cadastrar">
              Cadastrar
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
