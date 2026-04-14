import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import tagImage from '../../assets/tag.png';
import api from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './TagForm.css';

export function TagForm() {
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
        const { data } = await api.get(`/tags/${editingId}`);
        setNome(data.nome);
        setDescricao(data.descricao);
      } catch (err) {
        console.error('Erro ao buscar tag', err);
        showToast('Erro ao carregar os dados da tag.', 'error');
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
        await api.put(`/tags/${editingId}`, {
          nome,
          descricao,
          ativo: true, // Assuming active by default on edit if not specified
        });
        showToast('Tag atualizada com sucesso.');
      } else {
        await api.post('/tags', {
          nome,
          descricao,
        });
        showToast('Tag cadastrada com sucesso.');
      }
      navigate('/dashboard/tags');
    } catch (err) {
      console.error('Erro ao salvar tag', err);
      showToast('Erro ao salvar tag.', 'error');
    } finally {
      setIsLoading(false);
    }
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

            <button
              className="tag-form__button tag-form__button--primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (editingId ? 'Salvando...' : 'Cadastrando...') : (editingId ? 'Salvar' : 'Cadastrar')}
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
