import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import api from '../../services/api';
import './Informativos.css';

type Tab = 'informativos' | 'questionarios';
const PAGE_SIZE = 6;

export function Informativos() {
  const [activeTab, setActiveTab] = useState<Tab>('informativos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [informativos, setInformativos] = useState<any[]>([]);
  const [questionarios, setQuestionarios] = useState<any[]>([]);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'professor' || user?.role === 'monitor';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [infoRes, quizRes] = await Promise.all([
          api.get('/informativos'),
          api.get('/quizzes')
        ]);
        setInformativos(infoRes.data || []);
        const quizzes = (quizRes.data || []).map((q: any) => ({
          ...q,
          category: q.categoria || 'Geral',
        }));
        setQuestionarios(quizzes);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allCategories = Array.from(
    new Set([
      ...informativos.map((i) => i.category),
      ...questionarios.map((q) => q.category),
    ])
  ).filter(Boolean).sort();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredInformativos = selectedCategory
    ? informativos.filter((i) => i.category === selectedCategory)
    : informativos;

  const filteredQuestionarios = selectedCategory
    ? questionarios.filter((q) => q.category === selectedCategory)
    : questionarios;

  // Pagination for the active tab
  const activeItems = activeTab === 'informativos' ? filteredInformativos : filteredQuestionarios;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE)), [activeItems.length]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategory]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return activeItems.slice(start, start + PAGE_SIZE);
  }, [activeItems, currentPage]);

  // Skeleton loader
  if (loading) {
    return (
      <section className="informativos" id="informativos-page">
        <div className="informativos__header">
          <div className="informativos__tabs">
            <div className="informativos__skeleton informativos__skeleton--tab" />
            <div className="informativos__skeleton informativos__skeleton--tab" />
          </div>
        </div>
        <div className="informativos__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="informativos__skeleton-card">
              <div className="informativos__skeleton informativos__skeleton--image" />
              <div className="informativos__skeleton-body">
                <div className="informativos__skeleton informativos__skeleton--title" />
                <div className="informativos__skeleton informativos__skeleton--text" />
                <div className="informativos__skeleton informativos__skeleton--text informativos__skeleton--short" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="informativos" id="informativos-page">
      {/* Header: tabs + filter + add button */}
      <div className="informativos__header">
        <div className="informativos__tabs">
          <button
            className={`informativos__tab${activeTab === 'informativos' ? ' informativos__tab--active' : ''}`}
            onClick={() => setActiveTab('informativos')}
            id="tab-informativos"
          >
            Ver Informativos
          </button>
          <button
            className={`informativos__tab${activeTab === 'questionarios' ? ' informativos__tab--active' : ''}`}
            onClick={() => setActiveTab('questionarios')}
            id="tab-questionarios"
          >
            Ver Questionários
          </button>
        </div>

        <div className="informativos__header-actions">
          {/* Add button for admin/monitor */}
          {isAdmin && activeTab === 'informativos' && (
            <button
              className="informativos__add-btn"
              type="button"
              onClick={() => navigate('/dashboard/informativos/adicionar')}
            >
              <img src={iconeAdicionar} alt="" aria-hidden="true" />
              <span>Adicionar</span>
            </button>
          )}

          {/* Filter dropdown */}
          <div className="informativos__filter-wrapper" ref={filterRef}>
            <button
              className={`informativos__filter${selectedCategory ? ' informativos__filter--active' : ''}`}
              id="btn-filtro"
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              <svg className="informativos__filter-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z" />
              </svg>
              {selectedCategory || 'Filtro'}
            </button>

            {filterOpen && (
              <div className="informativos__dropdown" id="filter-dropdown">
                <button
                  className={`informativos__dropdown-item${!selectedCategory ? ' informativos__dropdown-item--active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(null);
                    setFilterOpen(false);
                  }}
                >
                  Todos
                </button>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`informativos__dropdown-item${selectedCategory === cat ? ' informativos__dropdown-item--active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFilterOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="informativos__grid">
        {activeTab === 'informativos' &&
          paginatedItems.map((card) => (
            <article
              className="informativos__card"
              key={card.id}
              onClick={() => navigate(`/dashboard/informativos/${card.id}`)}
            >
              <div className="informativos__card-image" />
              <div className="informativos__card-body">
                <h3 className="informativos__card-title">
                  {card.title}
                </h3>
                <p className="informativos__card-desc">{card.summary}</p>
                <div className="informativos__card-footer">
                  <span className="informativos__card-tag">{card.category}</span>
                  {isAdmin && (
                    <button
                      className="informativos__card-edit"
                      type="button"
                      aria-label="Editar informativo"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/informativos/adicionar?id=${card.id}`);
                      }}
                    >
                      <img src={iconeEditar} alt="" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

        {activeTab === 'questionarios' &&
          paginatedItems.map((card) => (
            <article
              className="informativos__card"
              key={card.id}
              onClick={() => navigate(`/dashboard/quizzes/${card.id}/fazer`)}
            >
              <div className="informativos__card-image" />
              <div className="informativos__card-body">
                <h3 className="informativos__card-title">
                  {card.titulo || card.nome || card.title}
                </h3>
                <p className="informativos__card-desc">{card.descricao || card.description || ''}</p>
                <div className="informativos__card-footer">
                  <span className="informativos__card-tag">{card.category}</span>
                  <span className="informativos__card-questions">
                    {Number(card.total_perguntas) || 0} questões
                  </span>
                </div>
              </div>
            </article>
          ))}

        {paginatedItems.length === 0 && (
          <div className="informativos__empty" style={{ gridColumn: '1 / -1' }}>
            <p>Nenhum {activeTab === 'informativos' ? 'informativo' : 'questionário'} encontrado{selectedCategory ? ` para "${selectedCategory}"` : ''}.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="informativos__pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ‹
          </button>
          <span className="informativos__page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
