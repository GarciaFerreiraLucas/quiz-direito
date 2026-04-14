import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import api from '../../services/api';
import { TablePagination } from '../../components/Pagination';
import './Perguntas.css';

const PAGE_SIZE = 8;

export function Perguntas() {
  const navigate = useNavigate();
  const params = useParams();
  const quizId = Number(params.quizId);

  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!Number.isFinite(quizId) || quizId <= 0) {
      navigate('/dashboard/quizzes');
      return;
    }

    async function fetchPerguntas() {
      try {
        const res = await api.get(`/perguntas?quizId=${quizId}`);
        setItems(res.data);
      } catch (err) {
        console.error('Erro ao buscar perguntas:', err);
      }
    }
    fetchPerguntas();
  }, [quizId, navigate]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [currentPage, items]);

  const emptyRowsCount = Math.max(0, PAGE_SIZE - pageItems.length);

  async function onToggleStatus(perguntaId: number) {
    try {
      const { data } = await api.patch(`/perguntas/${perguntaId}/status`);
      setItems((prev) => prev.map((item) => (item.id === perguntaId ? { ...item, ativo: data.ativo } : item)));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  }

  function onEdit(perguntaId: number) {
    navigate(`/dashboard/quizzes/${quizId}/perguntas/adicionar?id=${perguntaId}`);
  }

  return (
    <section className="perguntas-page" id="perguntas-page">
      <div className="perguntas-page__card">
        <div className="perguntas-page__header">
          <button
            className="perguntas-page__add-btn"
            type="button"
            onClick={() => navigate(`/dashboard/quizzes/${quizId}/perguntas/adicionar`)}
          >
            <img src={iconeAdicionar} alt="" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="perguntas-page__table-wrap">
          <table className="perguntas-page__table">
            <thead>
              <tr>
                <th>Pergunta</th>
                <th>Categoria</th>
                <th>Dificuldade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.pergunta}</td>
                  <td>{item.categoria}</td>
                  <td>{item.dificuldade}</td>
                  <td>
                    <span
                      className={`perguntas-page__status ${
                        item.ativo ? 'perguntas-page__status--active' : 'perguntas-page__status--inactive'
                      }`}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="perguntas-page__actions">
                      <button
                        className="perguntas-page__icon-btn"
                        type="button"
                        aria-label={item.ativo ? 'Inativar' : 'Ativar'}
                        onClick={() => onToggleStatus(item.id)}
                      >
                        <img src={item.ativo ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
                      </button>

                      <button
                        className="perguntas-page__icon-btn"
                        type="button"
                        aria-label="Editar"
                        onClick={() => onEdit(item.id)}
                      >
                        <img src={iconeEditar} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="perguntas-page__row--empty" aria-hidden="true">
                  <td colSpan={5}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          className="perguntas-page__pagination"
          pageNumberClassName="perguntas-page__page-number"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Paginação"
        />
      </div>
    </section>
  );
}
