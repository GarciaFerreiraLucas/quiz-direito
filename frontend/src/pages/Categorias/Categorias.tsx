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
import './Categorias.css';

const PAGE_SIZE = 8;

export function Categorias() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; nome: string; ativo: boolean } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/categorias');
        setItems(res.data);
      } catch (err) {
        console.error('Erro ao buscar as categorias', err);
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
      const { data } = await api.patch(`/categorias/${id}/status`);
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      showToast(`Categoria ${data.ativo ? 'ativada' : 'desativada'} com sucesso.`);
    } catch (err) {
      console.error('Erro ao alterar status', err);
      showToast('Erro ao alterar status.', 'error');
    }
    setConfirmAction(null);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/categorias/adicionar?id=${id}`);
  }

  return (
    <section className="categorias-list-page" id="categorias-page">
      <div className="categorias-list-page__card">
        <div className="categorias-list-page__header">
          <input
            className="categorias-list-page__search"
            type="text"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            id="categorias-search"
          />
          <button
            className="categorias-list-page__add-btn"
            type="button"
            onClick={() => navigate('/dashboard/categorias/adicionar')}
          >
            <img src={iconeAdicionar} alt="" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="categorias-list-page__table-wrap">
          <table className="categorias-list-page__table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
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
                      className={`categorias-list-page__status ${
                        item.ativo ? 'categorias-list-page__status--active' : 'categorias-list-page__status--inactive'
                      }`}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="categorias-list-page__actions">
                      <button
                        className="categorias-list-page__icon-btn"
                        type="button"
                        aria-label={item.ativo ? 'Inativar' : 'Ativar'}
                        onClick={() => setConfirmAction({ id: item.id, nome: item.nome, ativo: item.ativo })}
                      >
                        <img src={item.ativo ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
                      </button>

                      <button
                        className="categorias-list-page__icon-btn"
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
                <tr key={`empty-row-${index}`} className="categorias-list-page__row--empty" aria-hidden="true">
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          className="categorias-list-page__pagination"
          pageNumberClassName="categorias-list-page__page-number"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Paginação"
        />
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.ativo ? 'Desativar Categoria' : 'Ativar Categoria'}
          message={`Deseja ${confirmAction.ativo ? 'desativar' : 'ativar'} a categoria "${confirmAction.nome}"?`}
          confirmLabel={confirmAction.ativo ? 'Desativar' : 'Ativar'}
          danger={confirmAction.ativo}
          onConfirm={() => handleToggleStatus(confirmAction.id)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </section>
  );
}
