import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInformativos, mockQuestionarios } from './data';
import './Informativos.css';

type Tab = 'informativos' | 'questionarios';

// Extract unique categories from both data sets
const allCategories = Array.from(
  new Set([
    ...mockInformativos.map((i) => i.category),
    ...mockQuestionarios.map((q) => q.category),
  ])
).sort();

export function Informativos() {
  const [activeTab, setActiveTab] = useState<Tab>('informativos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    ? mockInformativos.filter((i) => i.category === selectedCategory)
    : mockInformativos;

  const filteredQuestionarios = selectedCategory
    ? mockQuestionarios.filter((q) => q.category === selectedCategory)
    : mockQuestionarios;

  return (
    <section className="informativos" id="informativos-page">
      {/* Header: tabs + filter */}
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

      {/* Cards grid */}
      <div className="informativos__grid">
        {activeTab === 'informativos' &&
          filteredInformativos.map((card) => (
            <article
              className="informativos__card"
              key={card.id}
              onClick={() => navigate(`/dashboard/informativos/${card.id}`)}
            >
              <div className="informativos__card-image" />
              <div className="informativos__card-body">
                <h3 className="informativos__card-title">
                  <span className="informativos__card-title-icon">📄</span>
                  {card.title}
                </h3>
                <p className="informativos__card-desc">{card.summary}</p>
                <span className="informativos__card-tag">{card.category}</span>
              </div>
            </article>
          ))}

        {activeTab === 'informativos' && filteredInformativos.length === 0 && (
          <div className="informativos__empty" style={{ gridColumn: '1 / -1' }}>
            <p>Nenhum informativo encontrado para "{selectedCategory}".</p>
          </div>
        )}

        {activeTab === 'questionarios' &&
          filteredQuestionarios.map((card) => (
            <article
              className="informativos__card"
              key={card.id}
              onClick={() => navigate(`/dashboard/informativos/questionario/${card.id}`)}
            >
              <div className="informativos__card-image" />
              <div className="informativos__card-body">
                <h3 className="informativos__card-title">
                  <span className="informativos__card-title-icon">❓</span>
                  {card.title}
                </h3>
                <p className="informativos__card-desc">{card.description}</p>
                <div className="informativos__card-footer">
                  <span className="informativos__card-tag">{card.category}</span>
                  <span className="informativos__card-questions">
                    {card.questions} questões
                  </span>
                </div>
              </div>
            </article>
          ))}

        {activeTab === 'questionarios' && filteredQuestionarios.length === 0 && (
          <div className="informativos__empty" style={{ gridColumn: '1 / -1' }}>
            <p>Nenhum questionário encontrado para "{selectedCategory}".</p>
          </div>
        )}
      </div>
    </section>
  );
}
