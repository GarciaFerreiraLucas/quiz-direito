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
import './Monitores.css';

type MonitorItem = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
};

const PAGE_SIZE = 8;

export function Monitores() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [monitores, setMonitores] = useState<MonitorItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; nome: string; ativo: boolean } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/monitores');
        setMonitores(res.data);
      } catch (err) {
        console.error('Erro ao buscar monitores', err);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return monitores;
    const term = searchTerm.toLowerCase();
    return monitores.filter(
      (item) =>
        item.nome?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
    );
  }, [monitores, searchTerm]);

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
      const { data } = await api.patch(`/monitores/${id}/status`);
      setMonitores((prev) => prev.map((item) => (item.id === id ? data : item)));
      showToast(`Monitor ${data.ativo ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (err) {
      console.error('Erro ao alterar status', err);
      showToast('Erro ao alterar status.', 'error');
    }
    setConfirmAction(null);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/monitores/adicionar?id=${id}`);
  }

  return (
    <section className="monitores-page" id="monitores-page">
      <div className="monitores-page__card">
        <div className="monitores-page__header">
          <input
            className="monitores-page__search"
            type="text"
            placeholder="Buscar monitores..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            id="monitores-search"
          />
          <button className="monitores-page__add-btn" type="button" onClick={() => navigate('/dashboard/monitores/adicionar')}>
            <img src={iconeAdicionar} alt="" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="monitores-page__table-wrap">
          <table className="monitores-page__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((monitor) => (
                <tr key={monitor.id}>
                  <td>{monitor.nome}</td>
                  <td>{monitor.email}</td>
                  <td>
                    <span
                      className={`monitores-page__status ${
                        monitor.ativo ? 'monitores-page__status--active' : 'monitores-page__status--inactive'
                      }`}
                    >
                      {monitor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="monitores-page__actions">
                      <button
                        className="monitores-page__icon-btn"
                        type="button"
                        aria-label={monitor.ativo ? 'Inativar monitor' : 'Ativar monitor'}
                        onClick={() => setConfirmAction({ id: monitor.id, nome: monitor.nome, ativo: monitor.ativo })}
                      >
                        <img src={monitor.ativo ? iconeInativar : iconeAtivar} alt="" aria-hidden="true" />
                      </button>

                      <button
                        className="monitores-page__icon-btn"
                        type="button"
                        aria-label="Editar monitor"
                        onClick={() => goToEdit(monitor.id)}
                      >
                        <img src={iconeEditar} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="monitores-page__row--empty" aria-hidden="true">
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          className="monitores-page__pagination"
          pageNumberClassName="monitores-page__page-number"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.ativo ? 'Desativar Monitor' : 'Ativar Monitor'}
          message={`Deseja ${confirmAction.ativo ? 'desativar' : 'ativar'} o monitor "${confirmAction.nome}"?`}
          confirmLabel={confirmAction.ativo ? 'Desativar' : 'Ativar'}
          danger={confirmAction.ativo}
          onConfirm={() => handleToggleStatus(confirmAction.id)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </section>
  );
}
