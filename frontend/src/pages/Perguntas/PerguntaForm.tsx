import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './PerguntaForm.css';

const DIFICULDADES = ['facil', 'medio', 'dificil'] as const;
const DIFICULDADE_LABELS: Record<string, string> = { facil: 'Fácil', medio: 'Moderada', dificil: 'Difícil' };

type Alternativa = { texto: string; feedback: string; correta: boolean };

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

  const [categorias, setCategorias] = useState<any[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [dificuldade, setDificuldade] = useState<string>('facil');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [alternativas, setAlternativas] = useState<Alternativa[]>(buildInitialAlternativas());
  const [loading, setLoading] = useState(false);

  // Fetch categorias from API
  useEffect(() => {
    async function loadCategorias() {
      try {
        const res = await api.get('/categorias');
        setCategorias(res.data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }
    loadCategorias();
  }, []);

  // If editing, load existing question
  useEffect(() => {
    if (!Number.isFinite(quizId) || quizId <= 0) {
      navigate('/dashboard/quizzes');
      return;
    }

    if (!editingId) return;

    async function loadPergunta() {
      try {
        const res = await api.get(`/perguntas/${editingId}`);
        const p = res.data;
        setPergunta(p.pergunta);
        setCategoriaId(p.categoriaId || '');
        setDificuldade(p.dificuldade || 'facil');
        setStatus(p.ativo ? 'ativo' : 'inativo');
        if (p.alternativas && p.alternativas.length > 0) {
          setAlternativas(
            p.alternativas.map((a: any) => ({ texto: a.texto, feedback: a.feedback || '', correta: !!a.correta }))
          );
        }
      } catch (err) {
        console.error('Erro ao carregar pergunta para edição:', err);
      }
    }
    loadPergunta();
  }, [quizId, editingId, navigate]);

  function updateAlternativa(index: number, patch: Partial<Alternativa>) {
    setAlternativas((current) =>
      current.map((alt, i) => (i === index ? { ...alt, ...patch } : alt)),
    );
  }

  function setCorreta(index: number) {
    setAlternativas((current) => current.map((alt, i) => ({ ...alt, correta: i === index })));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasCorreta = alternativas.some((alt) => alt.correta);
    const hasTextoVazio = alternativas.some((alt) => !alt.texto.trim());

    if (!pergunta.trim() || !hasCorreta || hasTextoVazio) {
      return;
    }

    const payload = {
      enunciado: pergunta.trim(),
      categoriaId: categoriaId || null,
      dificuldade,
      status: status === 'ativo',
      alternativas: alternativas.map((a) => ({ texto: a.texto.trim(), correta: a.correta })),
      quizId,
    };

    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/perguntas/${editingId}`, payload);
      } else {
        await api.post('/perguntas', payload);
      }
      navigate(`/dashboard/quizzes/${quizId}/perguntas`);
    } catch (err) {
      console.error('Erro ao salvar pergunta:', err);
    } finally {
      setLoading(false);
    }
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
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value ? Number(event.target.value) : '')}
            >
              <option value="">Selecionar</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
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
              onChange={(event) => setDificuldade(event.target.value)}
            >
              {DIFICULDADES.map((item) => (
                <option key={item} value={item}>
                  {DIFICULDADE_LABELS[item]}
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

        <button className="pergunta-form-page__button pergunta-form-page__button--primary" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
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
