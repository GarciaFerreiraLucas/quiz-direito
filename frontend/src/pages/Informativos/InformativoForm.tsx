import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import './InformativoForm.css';

type TagOption = { id: number; nome: string };

export function InformativoForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const editingId = useMemo(() => {
    const rawId = searchParams.get('id');
    if (!rawId) return null;
    const numericId = Number(rawId);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;
    return numericId;
  }, [searchParams]);

  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [autor, setAutor] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [error, setError] = useState('');

  // Tags support
  const [allTags, setAllTags] = useState<TagOption[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Load all available tags
  useEffect(() => {
    async function loadTags() {
      try {
        const res = await api.get('/tags');
        setAllTags((res.data || []).filter((t: any) => t.ativo !== false));
      } catch (err) {
        console.error('Erro ao carregar tags:', err);
      }
    }
    loadTags();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    async function loadInformativo() {
      try {
        const res = await api.get(`/informativos/${editingId}`);
        const info = res.data;
        setTitulo(info.title || '');
        setResumo(info.summary || '');
        setConteudo(info.content || '');
        setAutor(info.author || '');
        setStatus(info.ativo ? 'ativo' : 'inativo');
        if (info.tags && Array.isArray(info.tags)) {
          setSelectedTagIds(info.tags.map((t: any) => t.id));
        }
      } catch (err) {
        console.error('Erro ao carregar informativo:', err);
      }
    }
    loadInformativo();
  }, [editingId]);

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('Título é obrigatório.');
      return;
    }

    try {
      const payload = {
        titulo: titulo.trim(),
        resumo: resumo.trim(),
        conteudo_md: conteudo.trim(),
        autor: autor.trim(),
        ativo: status === 'ativo',
        tagIds: selectedTagIds,
      };

      if (editingId) {
        await api.put(`/informativos/${editingId}`, payload);
        showToast('Informativo atualizado com sucesso!');
      } else {
        await api.post('/informativos', payload);
        showToast('Informativo publicado com sucesso!');
      }

      navigate('/dashboard/informativos');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar informativo.');
    }
  }

  return (
    <section className="informativo-form-page" id="informativo-form-page">
      <div className="informativo-form-page__card">
        <form className="informativo-form" onSubmit={handleSubmit}>
          <h3 className="informativo-form__title">
            {editingId ? 'Editar Informativo' : 'Novo Informativo'}
          </h3>

          {error && (
            <p className="informativo-form__error">{error}</p>
          )}

          <label className="informativo-form__label" htmlFor="info-titulo">
            Título <span className="informativo-form__required">*</span>
          </label>
          <input
            id="info-titulo"
            className="informativo-form__input"
            placeholder="Título do informativo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <label className="informativo-form__label" htmlFor="info-autor">
            Autor
          </label>
          <input
            id="info-autor"
            className="informativo-form__input"
            placeholder="Nome do autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
          />

          <label className="informativo-form__label" htmlFor="info-resumo">
            Resumo
          </label>
          <input
            id="info-resumo"
            className="informativo-form__input"
            placeholder="Breve descrição do informativo"
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
          />

          <label className="informativo-form__label" htmlFor="info-conteudo">
            Conteúdo
          </label>
          <textarea
            id="info-conteudo"
            className="informativo-form__textarea"
            placeholder="Escreva o conteúdo completo do informativo..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={8}
          />

          {/* Tags multi-select */}
          {allTags.length > 0 && (
            <>
              <label className="informativo-form__label">Tags</label>
              <div className="informativo-form__tags-grid">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`informativo-form__tag-chip ${selectedTagIds.includes(tag.id) ? 'informativo-form__tag-chip--active' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.nome}
                  </button>
                ))}
              </div>
            </>
          )}

          {editingId && (
            <>
              <label className="informativo-form__label" htmlFor="info-status">
                Status
              </label>
              <select
                id="info-status"
                className="informativo-form__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </>
          )}

          <button className="informativo-form__button informativo-form__button--primary" type="submit">
            {editingId ? 'Salvar' : 'Publicar'}
          </button>

          <button
            className="informativo-form__button informativo-form__button--secondary"
            type="button"
            onClick={() => navigate('/dashboard/informativos')}
          >
            Voltar
          </button>
        </form>
      </div>
    </section>
  );
}
