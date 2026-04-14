import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Historico.css';

type TentativaItem = {
  tentativaId: number;
  quizId: number;
  quizTitulo: string;
  inicioEm: string;
  fimEm: string | null;
  duracaoSeg: number | null;
  pontuacao: number | null;
  finalizada: boolean;
};

export function Historico() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TentativaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/tentativas/historico');
        setItems(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatDuration(seg: number | null): string {
    if (!seg) return '—';
    const min = Math.floor(seg / 60);
    const sec = seg % 60;
    return `${min}m ${sec}s`;
  }

  function getScoreClass(score: number | null): string {
    if (score === null) return '';
    if (score >= 70) return 'historico__score--high';
    if (score >= 40) return 'historico__score--mid';
    return 'historico__score--low';
  }

  if (loading) {
    return (
      <section className="historico" id="historico-page">
        <p className="historico__empty">Carregando histórico...</p>
      </section>
    );
  }

  return (
    <section className="historico" id="historico-page">
      <div className="historico__header">
        <h2 className="historico__title">Histórico de Tentativas</h2>
        <p className="historico__subtitle">Acompanhe todas as suas tentativas de quiz</p>
      </div>

      {items.length === 0 ? (
        <div className="historico__empty">
          <p>Você ainda não realizou nenhum quiz.</p>
        </div>
      ) : (
        <div className="historico__card">
          <div className="historico__table-wrap">
            <table className="historico__table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Data</th>
                  <th>Duração</th>
                  <th>Pontuação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.tentativaId}>
                    <td>{item.quizTitulo}</td>
                    <td>{formatDate(item.inicioEm)}</td>
                    <td>{formatDuration(item.duracaoSeg)}</td>
                    <td>
                      {item.pontuacao !== null ? (
                        <span className={`historico__score ${getScoreClass(item.pontuacao)}`}>
                          {Math.round(item.pontuacao)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`historico__status ${item.finalizada ? 'historico__status--done' : 'historico__status--pending'}`}>
                        {item.finalizada ? 'Finalizada' : 'Em andamento'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button className="historico__btn-voltar" onClick={() => navigate('/dashboard')}>
        Voltar
      </button>
    </section>
  );
}
