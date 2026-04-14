import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './UserDashboard.css';

type Stats = {
  totalTentativas: number;
  mediaPontuacao: number;
  melhorNota: number;
  totalAcertos: number;
  ultimaTentativa: { quizTitulo: string; pontuacao: number; data: string } | null;
};

export function UserDashboard() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [informativos, setInformativos] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      // Fetch public data (quizzes and informativos)
      
      try {
        const [qRes, iRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/informativos'),
        ]);
        setQuizzes((qRes.data || []).filter((q: any) => q.ativo !== false).slice(0, 3));
        setInformativos((iRes.data || []).slice(0, 3));

        // Only load stats if not guest
        if (!isGuest) {
          const sRes = await api.get('/dashboard/stats');
          setStats(sRes.data);
        } else {
          // Empty stats for guests
          setStats({
            totalTentativas: 0,
            mediaPontuacao: 0,
            melhorNota: 0,
            totalAcertos: 0,
            ultimaTentativa: null,
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      }
    }
    load();
  }, [isGuest]);

  return (
    <section className="user-dash" id="user-dashboard-page">

      {/* Saudação */}
      <div className="user-dash__welcome">
        <h2 className="user-dash__greeting">
          {isGuest ? 'Bem-vindo ao Quiz Direito!' : `Olá, ${user?.name || 'Estudante'}!`}
        </h2>
        <p className="user-dash__greeting-sub">
          {isGuest
            ? 'Explore os quizzes e informativos disponíveis.'
            : 'Acompanhe seu progresso e continue estudando.'}
        </p>
      </div>

      {/* Banner convidado */}
      {isGuest && (
        <div className="user-dash__guest-banner">
          <p>Crie sua conta para salvar seu progresso e acompanhar suas notas!</p>
          <button onClick={() => navigate('/cadastro')}>Criar Conta</button>
        </div>
      )}

      {/* Cards de estatísticas (apenas logado) */}
      {!isGuest && stats && (
        <div className="user-dash__stats">
          <div className="user-dash__stat-card">
            <span className="user-dash__stat-value">{stats.totalTentativas}</span>
            <span className="user-dash__stat-label">Quizzes Feitos</span>
          </div>
          <div className="user-dash__stat-card">
            <span className="user-dash__stat-value">{Math.round(stats.mediaPontuacao)}%</span>
            <span className="user-dash__stat-label">Média Geral</span>
          </div>
          <div className="user-dash__stat-card">
            <span className="user-dash__stat-value">{Math.round(stats.melhorNota)}%</span>
            <span className="user-dash__stat-label">Melhor Nota</span>
          </div>
          <div className="user-dash__stat-card">
            <span className="user-dash__stat-value">{stats.totalAcertos}</span>
            <span className="user-dash__stat-label">Acertos Totais</span>
          </div>
        </div>
      )}

      {/* Última tentativa */}
      {!isGuest && stats?.ultimaTentativa && (
        <div className="user-dash__last-attempt">
          <span className="user-dash__last-label">Última tentativa:</span>
          <span className="user-dash__last-detail">
            {stats.ultimaTentativa.quizTitulo} — {Math.round(stats.ultimaTentativa.pontuacao)}%
          </span>
        </div>
      )}

      {/* Quizzes recentes */}
      <div className="user-dash__section">
        <div className="user-dash__section-header">
          <h3 className="user-dash__section-title">Quizzes Recentes</h3>
          <button className="user-dash__see-all" onClick={() => navigate('/dashboard/quizzes')}>
            Ver todos
          </button>
        </div>

        {quizzes.length === 0 ? (
          <p className="user-dash__empty">Nenhum quiz disponível.</p>
        ) : (
          <div className="user-dash__cards-row">
            {quizzes.map((q) => (
              <div className="user-dash__mini-card" key={q.id}>
                <h4 className="user-dash__mini-card-title">{q.titulo || q.nome}</h4>
                <p className="user-dash__mini-card-desc">{q.descricao || 'Teste seus conhecimentos.'}</p>
                <button className="user-dash__mini-card-btn" onClick={() => navigate(`/dashboard/quizzes/${q.id}/fazer`)}>
                  Iniciar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informativos recentes */}
      <div className="user-dash__section">
        <div className="user-dash__section-header">
          <h3 className="user-dash__section-title">Informativos Recentes</h3>
          <button className="user-dash__see-all" onClick={() => navigate('/dashboard/informativos')}>
            Ver todos
          </button>
        </div>

        {informativos.length === 0 ? (
          <p className="user-dash__empty">Nenhum informativo disponível.</p>
        ) : (
          <div className="user-dash__cards-row">
            {informativos.map((inf: any) => (
              <div className="user-dash__mini-card" key={inf.id}>
                <h4 className="user-dash__mini-card-title">{inf.titulo}</h4>
                <p className="user-dash__mini-card-desc">{inf.resumo || 'Leia este informativo.'}</p>
                <button className="user-dash__mini-card-btn" onClick={() => navigate(`/dashboard/informativos/${inf.id}`)}>
                  Ler
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
