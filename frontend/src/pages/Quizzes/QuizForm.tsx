import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './QuizForm.css';

export function QuizForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = useMemo(() => {
    const rawId = searchParams.get('id');
    if (!rawId) return null;

    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;

    return numericId;
  }, [searchParams]);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [tempoEstimado, setTempoEstimado] = useState(10);
  const [tentativasMax, setTentativasMax] = useState(3);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [error, setError] = useState('');

  // Load categories from API for the dropdown
  useEffect(() => {
    async function loadCategorias() {
      try {
        const res = await api.get('/categorias');
        setCategorias(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    }
    loadCategorias();
  }, []);

  // Load existing quiz data if editing — uses GET /quizzes/:id
  useEffect(() => {
    if (!editingId) return;

    async function loadQuiz() {
      try {
        const res = await api.get(`/quizzes/${editingId}`);
        const quiz = res.data;
        if (quiz) {
          setNome(quiz.titulo || quiz.nome || '');
          setDescricao(quiz.descricao || '');
          setCategoriaId(quiz.id_categoria || '');
          setTempoEstimado(quiz.tempo_estimado_min || 10);
          setTentativasMax(quiz.tentativas_max || 3);
          setStatus(quiz.ativo ? 'ativo' : 'inativo');
        }
      } catch (err) {
        console.error('Erro ao carregar quiz:', err);
      }
    }
    loadQuiz();
  }, [editingId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('Título é obrigatório.');
      return;
    }

    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativo: status === 'ativo',
        id_categoria: categoriaId || null,
        tempo_estimado_min: tempoEstimado,
        tentativas_max: tentativasMax,
      };

      if (editingId) {
        await api.put(`/quizzes/${editingId}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }

      navigate('/dashboard/quizzes');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar quiz.');
    }
  }

  return (
    <section className="quiz-form-page" id="quiz-form-page">
      <div className="quiz-form-page__card">
        <div className="quiz-form-page__content">
          <form className="quiz-form" onSubmit={handleSubmit}>
            <h3 className="quiz-form__title">{editingId ? 'Editar Quiz' : 'Novo Quiz'}</h3>

            {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '0.95rem' }}>{error}</p>}

            <label className="quiz-form__label" htmlFor="quiz-nome">
              Título <span className="quiz-form__required">*</span>
            </label>
            <input
              id="quiz-nome"
              className="quiz-form__input"
              placeholder="Título do Quiz"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />

            <label className="quiz-form__label" htmlFor="quiz-descricao">
              Descrição
            </label>
            <input
              id="quiz-descricao"
              className="quiz-form__input"
              placeholder="Descrição do Quiz"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />

            <label className="quiz-form__label" htmlFor="quiz-categoria">
              Categoria
            </label>
            <select
              id="quiz-categoria"
              className="quiz-form__select"
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

            <label className="quiz-form__label" htmlFor="quiz-tempo">
              Tempo estimado (min)
            </label>
            <input
              id="quiz-tempo"
              type="number"
              min={1}
              className="quiz-form__input"
              value={tempoEstimado}
              onChange={(event) => setTempoEstimado(Number(event.target.value))}
            />

            <label className="quiz-form__label" htmlFor="quiz-tentativas">
              Tentativas máximas
            </label>
            <input
              id="quiz-tentativas"
              type="number"
              min={1}
              className="quiz-form__input"
              value={tentativasMax}
              onChange={(event) => setTentativasMax(Number(event.target.value))}
            />

            <label className="quiz-form__label" htmlFor="quiz-status">
              Status
            </label>
            <select
              id="quiz-status"
              className="quiz-form__select"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'ativo' | 'inativo')}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <button className="quiz-form__button quiz-form__button--primary" type="submit">
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>

            <button
              className="quiz-form__button quiz-form__button--secondary"
              type="button"
              onClick={() => navigate('/dashboard/quizzes')}
            >
              Voltar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
