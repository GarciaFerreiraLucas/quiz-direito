import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import { getMonitorById, saveMonitor } from '../../utils/monitorStore';
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

  useEffect(() => {
    if (!editingId) return;

    const monitor = getMonitorById(editingId);
    if (!monitor) return;

    setNome(monitor.nome);
    setEmail(monitor.email);
    setSenha(monitor.senha);
    setConfirmarSenha(monitor.senha);
    setAtivo(monitor.ativo);
  }, [editingId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim() || !email.trim() || !senha.trim()) return;
    if (senha !== confirmarSenha) return;

    saveMonitor(
      {
        nome,
        email,
        senha,
        ativo,
      },
      editingId ?? undefined,
    );

    navigate('/dashboard/monitores');
  }

  return (
    <section className="monitor-form-page" id="monitor-form-page">
      <h2 className="monitor-form-page__title">{editingId ? 'Editar Monitor' : 'Cadastro de Monitor'}</h2>

      <div className="monitor-form-page__card">
        <form className="monitor-form" onSubmit={handleSubmit}>
          <h3 className="monitor-form__title">{editingId ? 'Editar monitor' : 'Cadastro de monitor'}</h3>

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
            Senha <span className="monitor-form__required">*</span>
          </label>
          <div className="monitor-form__password-wrap">
            <input
              id="monitor-senha"
              className="monitor-form__input monitor-form__input--password"
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
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
            Confirmar Senha <span className="monitor-form__required">*</span>
          </label>
          <div className="monitor-form__password-wrap">
            <input
              id="monitor-confirmar-senha"
              className="monitor-form__input monitor-form__input--password"
              type={mostrarConfirmacao ? 'text' : 'password'}
              placeholder="Senha"
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              required
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
            Cadastrar
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
