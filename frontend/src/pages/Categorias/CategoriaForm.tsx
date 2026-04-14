import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import categoriaImage from '../../assets/categoria.png';
import api from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './CategoriaForm.css';

export function CategoriaForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const editingId = useMemo(() => {
    const rawId = searchParams.get('id');
    if (!rawId) return null;

    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;

    return numericId;
  }, [searchParams]);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!editingId) return;

    async function fetchItem() {
      try {
        const { data } = await api.get(`/categorias/${editingId}`);
        setNome(data.nome);
        setDescricao(data.descricao);
      } catch (err) {
        console.error('Erro ao buscar categoria', err);
        showToast('Erro ao carregar os dados da categoria.', 'error');
      }
    }

    fetchItem();
  }, [editingId, showToast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim() || isLoading) return;

    setIsLoading(true);
    try {
      if (editingId) {
        await api.put(`/categorias/${editingId}`, {
          nome,
          descricao,
          ativo: true,
        });
        showToast('Categoria atualizada com sucesso.');
      } else {
        await api.post('/categorias', {
          nome,
          descricao,
        });
        showToast('Categoria cadastrada com sucesso.');
      }
      navigate('/dashboard/categorias');
    } catch (err) {
      console.error('Erro ao salvar categoria', err);
      showToast('Erro ao salvar categoria.', 'error');
    } finally {
      setIsLoading(false);
    }
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

            <button
              className="categoria-form__button categoria-form__button--primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (editingId ? 'Salvando...' : 'Cadastrando...') : (editingId ? 'Salvar' : 'Cadastrar')}
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
