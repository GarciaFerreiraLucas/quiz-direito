import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import api from '../../services/api';
import { TablePagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { useToast } from '../../components/Toast/Toast';
import './Tags.css';

const PAGE_SIZE = 8;

export function Tags() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; nome: string; ativo: boolean } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/tags');
        setItems(res.data);
      } catch (err) {
        console.error('Erro ao buscar as tags', err);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.nome?.toLowerCase().includes(term) ||
        item.titulo?.toLowerCase().includes(term) ||
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
      const { data } = await api.patch(`/tags/${id}/status`);
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      showToast(`Tag ${data.ativo ? 'ativada' : 'desativada'} com sucesso.`);
    } catch (err) {
      console.error('Erro ao alterar status', err);
      showToast('Erro ao alterar status.', 'error');
    }
    setConfirmAction(null);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/tags/adicionar?id=${id}`);
  }

  return (
    <section className="tags-list-page" id="tags-page">
      <div className="tags-list-page__card">
        <div className="tags-list-page__header">
          <input
            className="tags-list-page__search"
            type="text"
            placeholder="Buscar tags..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            id="tags-search"
          />
          <button
            className="tags-list-page__add-btn"
            type="button"
            onClick={() => navigate('/dashboard/tags/adicionar')}
          >
            <img src={iconeAdicionar} alt="" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="tags-list-page__table-wrap">
          <table className="tags-list-page__table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tag</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.titulo}</td>
                  <td>{item.nome}</td>
                  <td>
                    <span
                      className={`tags-list-page__status ${
                        item.ativo ? 'tags-list-page__status--active' : 'tags-list-page__status--inactive'
                      }`}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="tags-list-page__actions">
                      <button
                        className="tags-list-page__icon-btn"
                        type="button"
                        aria-label={item.ativo ? 'Inativar' : 'Ativar'}
                        onClick={() => setConfirmAction({ id: item.id, nome: item.nome, ativo: item.ativo })}
                      >
                        <img src={item.ativo ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
                      </button>

                      <button
                        className="tags-list-page__icon-btn"
                        type="button"
                        aria-label="Editar"
                        onClick={() => goToEdit(item.id)}
                      >
                        <img src={iconeEditar} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="tags-list-page__row--empty" aria-hidden="true">
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          className="tags-list-page__pagination"
          pageNumberClassName="tags-list-page__page-number"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Paginação"
        />
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.ativo ? 'Desativar Tag' : 'Ativar Tag'}
          message={`Deseja ${confirmAction.ativo ? 'desativar' : 'ativar'} a tag "${confirmAction.nome}"?`}
          confirmLabel={confirmAction.ativo ? 'Desativar' : 'Ativar'}
          danger={confirmAction.ativo}
          onConfirm={() => handleToggleStatus(confirmAction.id)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </section>
  );
}
