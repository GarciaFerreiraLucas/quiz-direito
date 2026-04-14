import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './InformativoDetalhe.css';

export function InformativoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDetalhe() {
      try {
        const res = await api.get(`/informativos/${id}`);
        setItem(res.data);
        
        // Fetch related logic here if backend supported it, for now mock an empty array or fetch all to slice
        const allRes = await api.get('/informativos');
        const others = allRes.data.filter((i: any) => i.id !== Number(id)).slice(0, 3);
        setRelated(others);
      } catch (err) {
        console.error('Erro', err);
      }
    }
    fetchDetalhe();
  }, [id]);

  if (!item) {
    return (
      <section className="info-detalhe" id="informativo-detalhe-page">
        <p>Carregando Informativo...</p>
        <button className="info-detalhe__btn" onClick={() => navigate('/dashboard/informativos')}>
          Voltar
        </button>
      </section>
    );
  }

  return (
    <section className="info-detalhe" id="informativo-detalhe-page">
      <div className="info-detalhe__layout">
        {/* Left: content */}
        <div className="info-detalhe__content">
          <h1 className="info-detalhe__title">{item.title}</h1>
          <p className="info-detalhe__meta">
            Por {item.author} • {item.date} • {item.category}
          </p>

          {item.content.split('\n\n').map((p: string, i: number) => (
            <p className="info-detalhe__text" key={i}>
              {p}
            </p>
          ))}

          {/* Image placeholder */}
          <div className="info-detalhe__image" />

          <p className="info-detalhe__footnote">{item.footnote}</p>
        </div>

        {/* Right: actions */}
        <aside className="info-detalhe__actions">
          <button
            className="info-detalhe__btn info-detalhe__btn--outline"
            onClick={() => navigate('/dashboard/informativos')}
          >
            Voltar
          </button>
          <button className="info-detalhe__btn info-detalhe__btn--action">
            Curtir
          </button>
          <button className="info-detalhe__btn info-detalhe__btn--action">
            Compartilhar
          </button>
          <button className="info-detalhe__btn info-detalhe__btn--action">
            Sinalizar erro
          </button>
        </aside>
      </div>

      {/* Related */}
      <div className="info-detalhe__related">
        <h2 className="info-detalhe__related-title">Veja também</h2>
        <div className="info-detalhe__related-grid">
          {related.map((card) => (
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
                <span className="informativos__card-tag">{card.category}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
