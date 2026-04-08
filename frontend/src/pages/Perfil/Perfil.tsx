import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import iconeVisivel from '../../assets/icones/icone_ativar.svg'; // Using existing icons for eye toggle
import './Perfil.css';

export function Perfil() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleAlterar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação de senha
    if (senha && senha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    try {
      updateProfile({
        name: nome,
        email: email,
        ...(senha ? { password: senha } : {}),
      });
      setSuccess('Perfil atualizado com sucesso!');
      setSenha(''); // Clear password field after update
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handleVoltar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="perfil" id="perfil-page">
      <h2 className="perfil__title">Editar Perfil</h2>

      <form className="perfil__form" onSubmit={handleAlterar}>
        <div className="perfil__field">
          <label htmlFor="nome" className="perfil__label">Nome</label>
          <input
            type="text"
            id="nome"
            className="perfil__input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="cliente"
          />
        </div>

        <div className="perfil__field">
          <label htmlFor="email" className="perfil__label">Email</label>
          <input
            type="email"
            id="email"
            className="perfil__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="cliente@gmail.com"
          />
        </div>

        <div className="perfil__field">
          <label htmlFor="senha" className="perfil__label">Senha</label>
          <div className="perfil__password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="senha"
              className="perfil__input perfil__input--password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="************"
            />
            <div className="perfil__password-controls">
              <span className="perfil__show-password-text">Mostrar senha</span>
              <button
                type="button"
                className="perfil__password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img 
                  src={iconeVisivel} 
                  alt="Mostrar senha" 
                  className={`perfil__password-icon ${showPassword ? 'perfil__password-icon--active' : ''}`} 
                />
              </button>
            </div>
          </div>
        </div>

        {error && <p className="perfil__error">{error}</p>}
        {success && <p className="perfil__success">{success}</p>}

        <div className="perfil__actions">
          <button type="submit" className="perfil__btn perfil__btn--submit">
            Alterar
          </button>
          <button type="button" className="perfil__btn perfil__btn--cancel" onClick={handleVoltar}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
