import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import categoriaImage from '../../assets/categoria.png';
import { getCadastroItemById, saveCadastroItem } from '../../utils/cadastroStore';
import './CategoriaForm.css';

export function CategoriaForm() {
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

    const item = getCadastroItemById('categorias', editingId);
    if (!item) return;

    setNome(item.nome);
    setDescricao(item.descricao);
  }, [editingId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) return;

    saveCadastroItem(
      'categorias',
      {
        nome,
        descricao,
      },
      editingId ?? undefined,
    );

    navigate('/dashboard/categorias');
  }

  return (
    <section className="categoria-form-page" id="categoria-form-page">
      <div className="categoria-form-page__card">
        <div className="categoria-form-page__content">
          <form className="categoria-form" onSubmit={handleSubmit}>
            <h3 className="categoria-form__title">{editingId ? 'Editar Categoria' : 'Cadastro de Categoria'}</h3>

            <label className="categoria-form__label" htmlFor="categoria-nome">
              Nome da Categoria <span className="categoria-form__required">*</span>
            </label>
            <input
              id="categoria-nome"
              className="categoria-form__input"
              placeholder="Nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />

            <label className="categoria-form__label" htmlFor="categoria-descricao">
              Descrição
            </label>
            <textarea
              id="categoria-descricao"
              className="categoria-form__textarea"
              placeholder="Descrição"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />

            <button className="categoria-form__button categoria-form__button--primary" type="submit">
              {editingId ? 'Salvar' : 'Cadastrar'}
            </button>

            <button
              className="categoria-form__button categoria-form__button--secondary"
              type="button"
              onClick={() => navigate('/dashboard/categorias')}
            >
              Voltar
            </button>
          </form>

          <div className="categoria-form-page__image-wrap" aria-hidden="true">
            <img
              className="categoria-form-page__image"
              src={categoriaImage}
              alt="Ilustração de cadastro de categorias"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
