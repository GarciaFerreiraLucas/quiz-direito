import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { TablePagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import './Quizzes.css';

const PAGE_SIZE = 8;

/* ============================================================
   TELA DO ALUNO — Grid de Cards interativos para iniciar quizzes
   ============================================================ */
function QuizzesUser() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/quizzes');
        // Only show active quizzes to students
        setQuizzes((res.data || []).filter((q: any) => q.ativo !== false));
      } catch (err) {
        console.error('Erro ao carregar quizzes:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="user-quizzes" id="quizzes-page">
        <p className="user-quizzes__loading">Carregando quizzes...</p>
      </section>
    );
  }

  return (
    <section className="user-quizzes" id="quizzes-page">
      <div className="user-quizzes__header">
        <h2 className="user-quizzes__title">Quizzes Disponíveis</h2>
        <p className="user-quizzes__subtitle">Escolha um quiz e teste seus conhecimentos em Direito!</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="user-quizzes__empty">
          <p>Nenhum quiz disponível no momento.</p>
        </div>
      ) : (
        <div className="user-quizzes__grid">
          {quizzes.map((quiz) => (
            <article className="user-quizzes__card" key={quiz.id}>
              <div className="user-quizzes__card-body">
                <h3 className="user-quizzes__card-title">{quiz.titulo || quiz.nome}</h3>
                <p className="user-quizzes__card-desc">
                  {quiz.descricao || 'Teste seus conhecimentos neste quiz.'}
                </p>

                <div className="user-quizzes__card-meta">
                  {quiz.tempo_estimado_min && (
                    <span className="user-quizzes__card-badge">
                      {quiz.tempo_estimado_min} min
                    </span>
                  )}
                  {quiz.total_perguntas !== undefined && (
                    <span className="user-quizzes__card-badge">
                      {Number(quiz.total_perguntas)} perguntas
                    </span>
                  )}
                </div>
              </div>

              <button
                className="user-quizzes__card-btn"
                onClick={() => navigate(`/dashboard/quizzes/${quiz.id}/fazer`)}
              >
                Iniciar Quiz
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   TELA DO ADMIN/MONITOR — Tabela de gerenciamento (já existente)
   ============================================================ */
export function Quizzes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; nome: string; ativo: boolean } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/quizzes');
        setItems(res.data);
      } catch (err) {
        console.error('Erro ao buscar os quizzes', err);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.titulo?.toLowerCase().includes(term) ||
        item.nome?.toLowerCase().includes(term) ||
        item.categoria?.toLowerCase().includes(term) ||
        item.descricao?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)), [filteredItems.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredItems]);

  const emptyRowsCount = Math.max(0, PAGE_SIZE - pageItems.length);

  async function handleToggleStatus(id: number) {
    try {
      const { data } = await api.patch(`/quizzes/${id}/status`);
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
    } catch (err) {
      console.error('Erro ao alterar status', err);
    }
    setConfirmAction(null);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/quizzes/adicionar?id=${id}`);
  }

  function goToPerguntas(id: number) {
    navigate(`/dashboard/quizzes/${id}/perguntas`);
  }

  // User role sees the card-based quiz browser
  if (user?.role === 'user') {
    return <QuizzesUser />;
  }

  // Admin/Monitor sees the management table
  return (
    <section className="quizzes-list-page" id="quizzes-page">
      <div className="quizzes-list-page__card">
        <div className="quizzes-list-page__header">
          <input
            className="quizzes-list-page__search"
            type="text"
            placeholder="Buscar quizzes..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            id="quizzes-search"
          />
          <button
            className="quizzes-list-page__add-btn"
            type="button"
            onClick={() => navigate('/dashboard/quizzes/adicionar')}
          >
            <img src={iconeAdicionar} alt="" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="quizzes-list-page__table-wrap">
          <table className="quizzes-list-page__table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Perguntas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id} onClick={() => goToPerguntas(item.id)}>
                  <td>{item.titulo}</td>
                  <td>{item.categoria || '—'}</td>
                  <td>{Number(item.total_perguntas) || 0}</td>
                  <td>
                    <span
                      className={`quizzes-list-page__status ${
                        item.ativo ? 'quizzes-list-page__status--active' : 'quizzes-list-page__status--inactive'
                      }`}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="quizzes-list-page__actions">
                      <button
                        className="quizzes-list-page__icon-btn"
                        type="button"
                        aria-label={item.ativo ? 'Inativar' : 'Ativar'}
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmAction({ id: item.id, nome: item.titulo || item.nome, ativo: !!item.ativo });
                        }}
                      >
                        <img src={item.ativo ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
                      </button>

                      <button
                        className="quizzes-list-page__icon-btn"
                        type="button"
                        aria-label="Editar"
                        onClick={(event) => {
                          event.stopPropagation();
                          goToEdit(item.id);
                        }}
                      >
                        <img src={iconeEditar} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="quizzes-list-page__row--empty" aria-hidden="true">
                  <td colSpan={5}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          className="quizzes-list-page__pagination"
          pageNumberClassName="quizzes-list-page__page-number"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Paginação"
        />
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.ativo ? 'Desativar Quiz' : 'Ativar Quiz'}
          message={`Deseja ${confirmAction.ativo ? 'desativar' : 'ativar'} o quiz "${confirmAction.nome}"?`}
          confirmLabel={confirmAction.ativo ? 'Desativar' : 'Ativar'}
          danger={confirmAction.ativo}
          onConfirm={() => handleToggleStatus(confirmAction.id)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </section>
  );
}
