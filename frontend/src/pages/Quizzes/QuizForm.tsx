import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCadastroItemById, getCadastroItems, saveCadastroItem } from '../../utils/cadastroStore';
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

  const tagsDisponiveis = useMemo(
    () => getCadastroItems('tags').map((item) => item.nome).filter((nomeTag, index, lista) => lista.indexOf(nomeTag) === index),
    [],
  );

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  useEffect(() => {
    if (!editingId) return;

    const item = getCadastroItemById('quizzes', editingId);
    if (!item) return;

    setNome(item.nome);
    setDescricao(item.descricao);
    setTag(item.tag ?? '');
    setStatus(item.ativo ? 'ativo' : 'inativo');
  }, [editingId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim() || !tag.trim()) return;

    saveCadastroItem(
      'quizzes',
      {
        nome,
        descricao,
        tag,
        ativo: status === 'ativo',
      },
      editingId ?? undefined,
    );

    navigate('/dashboard/quizzes');
  }

  return (
    <section className="quiz-form-page" id="quiz-form-page">
      <div className="quiz-form-page__card">
        <div className="quiz-form-page__content">
          <form className="quiz-form" onSubmit={handleSubmit}>
            <h3 className="quiz-form__title">Quiz</h3>

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

            <label className="quiz-form__label" htmlFor="quiz-tag">
              Tag <span className="quiz-form__required">*</span>
            </label>
            <select
              id="quiz-tag"
              className="quiz-form__select"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              required
            >
              <option value="">Selecionar</option>
              {tagsDisponiveis.map((nomeTag) => (
                <option key={nomeTag} value={nomeTag}>
                  {nomeTag}
                </option>
              ))}
            </select>

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
