import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import api from '../../services/api';
import './MonitorForm.css';

export function MonitorForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = useMemo(() => {
    const rawId = searchParams.get('id');
    if (!rawId) return null;

    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;

    return numericId;
  }, [searchParams]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editingId) return;

    async function loadMonitor() {
      try {
        const res = await api.get(`/monitores/${editingId}`);
        const monitor = res.data;
        setNome(monitor.nome);
        setEmail(monitor.email);
        setAtivo(monitor.ativo);
      } catch (err) {
        console.error('Erro ao carregar monitor:', err);
      }
    }
    loadMonitor();
  }, [editingId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!nome.trim() || !email.trim()) {
      setError('Nome e Email são obrigatórios.');
      return;
    }

    // On create, password is required; on edit, it's optional
    if (!editingId && !senha.trim()) {
      setError('Senha é obrigatória para novo monitor.');
      return;
    }

    if (senha && senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (senha && senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/monitores/${editingId}`, {
          nome,
          email,
          senha: senha || undefined,
          ativo,
        });
      } else {
        await api.post('/monitores', {
          nome,
          email,
          senha,
        });
      }
      navigate('/dashboard/monitores');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar monitor.');
    }
  }

  return (
    <section className="monitor-form-page" id="monitor-form-page">
      <h2 className="monitor-form-page__title">{editingId ? 'Editar Monitor' : 'Cadastro de Monitor'}</h2>

      <div className="monitor-form-page__card">
        <form className="monitor-form" onSubmit={handleSubmit}>
          <h3 className="monitor-form__title">{editingId ? 'Editar monitor' : 'Cadastro de monitor'}</h3>

          {error && <p className="monitor-form__error" style={{ color: '#c0392b', marginBottom: '12px', fontSize: '0.95rem' }}>{error}</p>}

          <label className="monitor-form__label" htmlFor="monitor-nome">
            Nome <span className="monitor-form__required">*</span>
          </label>
          <input
            id="monitor-nome"
            className="monitor-form__input"
            placeholder="Nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />

          <label className="monitor-form__label" htmlFor="monitor-email">
            Email <span className="monitor-form__required">*</span>
          </label>
          <input
            id="monitor-email"
            className="monitor-form__input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="monitor-form__label" htmlFor="monitor-senha">
            Senha {!editingId && <span className="monitor-form__required">*</span>}
          </label>
          <div className="monitor-form__password-wrap">
            <input
              id="monitor-senha"
              className="monitor-form__input monitor-form__input--password"
              type={mostrarSenha ? 'text' : 'password'}
              placeholder={editingId ? 'Deixe em branco para manter a atual' : 'Senha'}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required={!editingId}
            />
            <button
              className="monitor-form__password-toggle"
              type="button"
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setMostrarSenha((prev) => !prev)}
            >
              <img src={mostrarSenha ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
            </button>
          </div>

          <label className="monitor-form__label" htmlFor="monitor-confirmar-senha">
            Confirmar Senha {!editingId && <span className="monitor-form__required">*</span>}
          </label>
          <div className="monitor-form__password-wrap">
            <input
              id="monitor-confirmar-senha"
              className="monitor-form__input monitor-form__input--password"
              type={mostrarConfirmacao ? 'text' : 'password'}
              placeholder={editingId ? 'Deixe em branco para manter a atual' : 'Confirmar Senha'}
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              required={!editingId}
            />
            <button
              className="monitor-form__password-toggle"
              type="button"
              aria-label={mostrarConfirmacao ? 'Ocultar confirmacao de senha' : 'Mostrar confirmacao de senha'}
              onClick={() => setMostrarConfirmacao((prev) => !prev)}
            >
              <img src={mostrarConfirmacao ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
            </button>
          </div>

          {editingId ? (
            <>
              <label className="monitor-form__label" htmlFor="monitor-status">
                Status
              </label>
              <select
                id="monitor-status"
                className="monitor-form__select"
                value={ativo ? 'ativo' : 'inativo'}
                onChange={(event) => setAtivo(event.target.value === 'ativo')}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </>
          ) : null}

          <button className="monitor-form__button monitor-form__button--primary" type="submit">
            {editingId ? 'Salvar' : 'Cadastrar'}
          </button>

          <button
            className="monitor-form__button monitor-form__button--secondary"
            type="button"
            onClick={() => navigate('/dashboard/monitores')}
          >
            Voltar
          </button>
        </form>
      </div>
    </section>
  );
}
