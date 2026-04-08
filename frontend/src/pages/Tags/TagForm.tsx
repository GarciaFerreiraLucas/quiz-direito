import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import tagImage from '../../assets/tag.png';
import { getCadastroItemById, saveCadastroItem } from '../../utils/cadastroStore';
import './TagForm.css';

export function TagForm() {
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
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (!editingId) return;

    const item = getCadastroItemById('tags', editingId);
    if (!item) return;

    setNome(item.nome);
    setDescricao(item.descricao);
  }, [editingId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) return;

    saveCadastroItem(
      'tags',
      {
        nome,
        descricao,
      },
      editingId ?? undefined,
    );

    navigate('/dashboard/tags');
  }

  return (
    <section className="tag-form-page" id="tag-form-page">
      <div className="tag-form-page__card">
        <div className="tag-form-page__content">
          <form className="tag-form" onSubmit={handleSubmit}>
            <h3 className="tag-form__title">{editingId ? 'Editar Tag' : 'Cadastro de Tag'}</h3>

            <label className="tag-form__label" htmlFor="tag-nome">
              Nome da Tag <span className="tag-form__required">*</span>
            </label>
            <input
              id="tag-nome"
              className="tag-form__input"
              placeholder="Nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />

            <label className="tag-form__label" htmlFor="tag-descricao">
              Descrição
            </label>
            <textarea
              id="tag-descricao"
              className="tag-form__textarea"
              placeholder="Descrição"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />

            <button className="tag-form__button tag-form__button--primary" type="submit">
              {editingId ? 'Salvar' : 'Cadastrar'}
            </button>

            <button
              className="tag-form__button tag-form__button--secondary"
              type="button"
              onClick={() => navigate('/dashboard/tags')}
            >
              Voltar
            </button>
          </form>

          <div className="tag-form-page__image-wrap" aria-hidden="true">
            <img className="tag-form-page__image" src={tagImage} alt="Ilustração de cadastro de tags" />
          </div>
        </div>
      </div>
    </section>
  );
}
