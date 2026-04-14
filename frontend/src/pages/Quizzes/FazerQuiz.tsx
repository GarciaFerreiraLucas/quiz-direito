import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './FazerQuiz.css';

type Alternativa = { id: number; texto: string; ordem: number };
type Pergunta = { id: number; enunciado: string; dificuldade: string; alternativas: Alternativa[] };
type QuizInfo = { id: number; titulo: string; tempoEstimadoMin: number };
type Detalhe = { perguntaId: number; enunciado: string; alternativaEscolhida: string; alternativaCorreta: string; acertou: boolean };
type Resultado = { pontuacao: number; totalPerguntas: number; acertos: number; erros: number; duracaoSegundos: number; detalhes: Detalhe[] };

export function FazerQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [tentativaId, setTentativaId] = useState<number | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Iniciar tentativa ao montar
  useEffect(() => {
    async function iniciar() {
      try {
        setLoading(true);
        const res = await api.post(`/tentativas/${quizId}`);
        setQuiz(res.data.quiz);
        setTentativaId(res.data.tentativaId);
        setPerguntas(res.data.perguntas);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao iniciar o quiz.');
      } finally {
        setLoading(false);
      }
    }
    iniciar();
  }, [quizId]);

  const perguntaAtual = perguntas[currentIndex];
  const totalPerguntas = perguntas.length;
  const progresso = totalPerguntas > 0 ? ((currentIndex + 1) / totalPerguntas) * 100 : 0;

  async function selecionarAlternativa(alternativaId: number) {
    if (!tentativaId || !perguntaAtual) return;
    setRespostas((prev) => ({ ...prev, [perguntaAtual.id]: alternativaId }));

    // Skip saving progress to DB if guest
    if (tentativaId === -1) return;

    try {
      await api.post(`/tentativas/${tentativaId}/responder`, {
        perguntaId: perguntaAtual.id,
        alternativaId,
      });
    } catch (err) {
      console.error('Erro ao salvar resposta:', err);
    }
  }

  function proximaPergunta() {
    if (currentIndex < totalPerguntas - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function perguntaAnterior() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  async function finalizar() {
    if (!tentativaId) return;
    try {
      setLoading(true);
      
      let res;
      if (tentativaId === -1) {
        // Send all responses in body for guest finalization
        const respostasArray = Object.entries(respostas).map(([pId, aId]) => ({
          perguntaId: Number(pId),
          alternativaId: aId,
        }));
        res = await api.post(`/tentativas/${tentativaId}/finalizar`, {
          respostas: respostasArray,
          duracaoSegundos: 0, // Could be calculated but keeping it simple
        });
      } else {
        res = await api.post(`/tentativas/${tentativaId}/finalizar`);
      }
      
      setResultado(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao finalizar quiz.');
    } finally {
      setLoading(false);
    }
  }

  // --- TELA DE ERRO ---
  if (error) {
    return (
      <section className="fazer-quiz" id="fazer-quiz-page">
        <div className="fazer-quiz__card fazer-quiz__card--center">
          <h2 className="fazer-quiz__title">Ops!</h2>
          <p className="fazer-quiz__error-text">{error}</p>
          <button className="fazer-quiz__btn fazer-quiz__btn--primary" onClick={() => navigate('/dashboard/quizzes')}>
            Voltar aos Quizzes
          </button>
        </div>
      </section>
    );
  }

  // --- TELA DE LOADING ---
  if (loading && !resultado) {
    return (
      <section className="fazer-quiz" id="fazer-quiz-page">
        <div className="fazer-quiz__card fazer-quiz__card--center">
          <p>Carregando quiz...</p>
        </div>
      </section>
    );
  }

  // --- TELA DE RESULTADO ---
  if (resultado) {
    return (
      <section className="fazer-quiz" id="fazer-quiz-page">
        <div className="fazer-quiz__card">
          <h2 className="fazer-quiz__title">Resultado</h2>
          <p className="fazer-quiz__subtitle">{quiz?.titulo}</p>

          <div className="fazer-quiz__score-ring">
            <span className="fazer-quiz__score-value">{Math.round(resultado.pontuacao)}%</span>
          </div>

          <div className="fazer-quiz__stats">
            <div className="fazer-quiz__stat">
              <span className="fazer-quiz__stat-num fazer-quiz__stat-num--green">{resultado.acertos}</span>
              <span className="fazer-quiz__stat-label">Acertos</span>
            </div>
            <div className="fazer-quiz__stat">
              <span className="fazer-quiz__stat-num fazer-quiz__stat-num--red">{resultado.erros}</span>
              <span className="fazer-quiz__stat-label">Erros</span>
            </div>
            <div className="fazer-quiz__stat">
              <span className="fazer-quiz__stat-num">{resultado.totalPerguntas}</span>
              <span className="fazer-quiz__stat-label">Total</span>
            </div>
          </div>

          <h3 className="fazer-quiz__section-title">Gabarito</h3>
          <div className="fazer-quiz__gabarito">
            {resultado.detalhes.map((d, i) => (
              <div key={i} className={`fazer-quiz__gabarito-item ${d.acertou ? 'fazer-quiz__gabarito-item--correct' : 'fazer-quiz__gabarito-item--wrong'}`}>
                <p className="fazer-quiz__gabarito-enunciado">{i + 1}. {d.enunciado}</p>
                <p className="fazer-quiz__gabarito-resp">
                  Sua resposta: <strong>{d.alternativaEscolhida}</strong>
                </p>
                {!d.acertou && (
                  <p className="fazer-quiz__gabarito-correta">
                    Correta: <strong>{d.alternativaCorreta}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>

          <button className="fazer-quiz__btn fazer-quiz__btn--primary" onClick={() => navigate('/dashboard/quizzes')}>
            Voltar aos Quizzes
          </button>
        </div>
      </section>
    );
  }

  // --- TELA DO QUIZ (Pergunta a Pergunta) ---
  return (
    <section className="fazer-quiz" id="fazer-quiz-page">
      <div className="fazer-quiz__card">
        <h2 className="fazer-quiz__title">{quiz?.titulo}</h2>

        <div className="fazer-quiz__progress-bar">
          <div className="fazer-quiz__progress-fill" style={{ width: `${progresso}%` }} />
        </div>
        <p className="fazer-quiz__progress-text">Pergunta {currentIndex + 1} de {totalPerguntas}</p>

        {perguntaAtual && (
          <div className="fazer-quiz__question">
            <p className="fazer-quiz__enunciado">{perguntaAtual.enunciado}</p>
            <span className="fazer-quiz__badge">{perguntaAtual.dificuldade}</span>

            <div className="fazer-quiz__alternativas">
              {perguntaAtual.alternativas.map((alt) => (
                <button
                  key={alt.id}
                  className={`fazer-quiz__alternativa ${respostas[perguntaAtual.id] === alt.id ? 'fazer-quiz__alternativa--selected' : ''}`}
                  onClick={() => selecionarAlternativa(alt.id)}
                >
                  {alt.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="fazer-quiz__nav">
          <button
            className="fazer-quiz__btn fazer-quiz__btn--secondary"
            onClick={perguntaAnterior}
            disabled={currentIndex === 0}
          >
            Anterior
          </button>

          {currentIndex < totalPerguntas - 1 ? (
            <button
              className="fazer-quiz__btn fazer-quiz__btn--primary"
              onClick={proximaPergunta}
              disabled={!respostas[perguntaAtual?.id]}
            >
              Próxima
            </button>
          ) : (
            <button
              className="fazer-quiz__btn fazer-quiz__btn--primary"
              onClick={finalizar}
              disabled={Object.keys(respostas).length < totalPerguntas}
            >
              Finalizar Quiz
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
