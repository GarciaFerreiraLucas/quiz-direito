import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCadastroItems } from '../../utils/cadastroStore';
import { getPerguntaById, savePergunta } from '../../utils/perguntasStore';
import type { Alternativa } from '../../utils/perguntasStore';
import './PerguntaForm.css';

const DIFICULDADES = ['Fácil', 'Moderada', 'Difícil'] as const;

function buildInitialAlternativas(): Alternativa[] {
  return [
    { texto: '', feedback: '', correta: true },
    { texto: '', feedback: '', correta: false },
    { texto: '', feedback: '', correta: false },
    { texto: '', feedback: '', correta: false },
  ];
}

export function PerguntaForm() {
  const navigate = useNavigate();
  const params = useParams();
  const quizId = Number(params.quizId);
  const [searchParams] = useSearchParams();

  const editingId = useMemo(() => {
    const raw = searchParams.get('id');
    if (!raw) return null;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
  }, [searchParams]);

  const categorias = useMemo(
    () =>
      getCadastroItems('categorias')
        .map((item) => item.nome)
        .filter((nome, index, lista) => lista.indexOf(nome) === index),
    [],
  );

  const [pergunta, setPergunta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dificuldade, setDificuldade] = useState<(typeof DIFICULDADES)[number]>('Fácil');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [alternativas, setAlternativas] = useState<Alternativa[]>(buildInitialAlternativas());

  useEffect(() => {
    if (!Number.isFinite(quizId) || quizId <= 0) {
      navigate('/dashboard/quizzes');
      return;
    }

    if (!editingId) return;

    const item = getPerguntaById(quizId, editingId);
    if (!item) return;

    setPergunta(item.pergunta);
    setCategoria(item.categoria);
    setDificuldade(item.dificuldade);
    setStatus(item.ativo ? 'ativo' : 'inativo');
    setAlternativas(item.alternativas);
  }, [quizId, editingId, navigate]);

  function updateAlternativa(index: number, patch: Partial<Alternativa>) {
    setAlternativas((current) =>
      current.map((alt, i) => (i === index ? { ...alt, ...patch } : alt)),
    );
  }

  function setCorreta(index: number) {
    setAlternativas((current) => current.map((alt, i) => ({ ...alt, correta: i === index })));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasCorreta = alternativas.some((alt) => alt.correta);
    const hasTextoVazio = alternativas.some((alt) => !alt.texto.trim());

    if (!pergunta.trim() || !categoria.trim() || !hasCorreta || hasTextoVazio) {
      return;
    }

    savePergunta(
      quizId,
      {
        pergunta,
        categoria,
        dificuldade,
        ativo: status === 'ativo',
        alternativas,
      },
      editingId ?? undefined,
    );

    navigate(`/dashboard/quizzes/${quizId}/perguntas`);
  }

  return (
    <section className="pergunta-form-page" id="pergunta-form-page">
      <form className="pergunta-form-page__card" onSubmit={handleSubmit}>
        <div className="pergunta-form-page__grid">
          <div className="pergunta-form-page__col">
            <h3 className="pergunta-form-page__section-title">Pergunta</h3>

            <label className="pergunta-form-page__label" htmlFor="pergunta-texto">
              Pergunta
            </label>
            <textarea
              id="pergunta-texto"
              className="pergunta-form-page__textarea"
              placeholder="Texto da Pergunta"
              value={pergunta}
              onChange={(event) => setPergunta(event.target.value)}
              required
            />

            <label className="pergunta-form-page__label" htmlFor="pergunta-categoria">
              Categoria
            </label>
            <select
              id="pergunta-categoria"
              className="pergunta-form-page__select"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              required
            >
              <option value="">Selecionar</option>
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="pergunta-form-page__label" htmlFor="pergunta-dificuldade">
              Dificuldade
            </label>
            <select
              id="pergunta-dificuldade"
              className="pergunta-form-page__select"
              value={dificuldade}
              onChange={(event) => setDificuldade(event.target.value as (typeof DIFICULDADES)[number])}
            >
              {DIFICULDADES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="pergunta-form-page__label" htmlFor="pergunta-status">
              Status
            </label>
            <select
              id="pergunta-status"
              className="pergunta-form-page__select"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'ativo' | 'inativo')}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="pergunta-form-page__col">
            <h3 className="pergunta-form-page__section-title">Alternativas</h3>

            {alternativas.map((alternativa, index) => (
              <div
                key={`alt-${index + 1}`}
                className={`pergunta-form-page__alternativa ${alternativa.correta ? 'pergunta-form-page__alternativa--active' : ''}`}
              >
                <label className="pergunta-form-page__label pergunta-form-page__label--alt" htmlFor={`alt-texto-${index}`}>
                  Alternativa {index + 1}
                </label>

                <div className="pergunta-form-page__alt-row">
                  <input
                    id={`alt-correta-${index}`}
                    type="radio"
                    name="alternativa-correta"
                    checked={alternativa.correta}
                    onChange={() => setCorreta(index)}
                    aria-label={`Marcar alternativa ${index + 1} como correta`}
                  />
                  <input
                    id={`alt-texto-${index}`}
                    className="pergunta-form-page__input"
                    placeholder="Texto da Alternativa"
                    value={alternativa.texto}
                    onChange={(event) => updateAlternativa(index, { texto: event.target.value })}
                    required
                  />
                </div>

                <input
                  className="pergunta-form-page__input pergunta-form-page__input--feedback"
                  placeholder="Feedback da Alternativa"
                  value={alternativa.feedback}
                  onChange={(event) => updateAlternativa(index, { feedback: event.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <button className="pergunta-form-page__button pergunta-form-page__button--primary" type="submit">
          {editingId ? 'Salvar' : 'Adicionar'}
        </button>

        <button
          className="pergunta-form-page__button pergunta-form-page__button--secondary"
          type="button"
          onClick={() => navigate(`/dashboard/quizzes/${quizId}/perguntas`)}
        >
          Voltar
        </button>
      </form>
    </section>
  );
}
