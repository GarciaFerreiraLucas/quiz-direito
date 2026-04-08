import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import { getMonitores, toggleMonitorStatus } from '../../utils/monitorStore';
import type { MonitorItem } from '../../utils/monitorStore';
import { TablePagination } from '../../components/Pagination';
import './Monitores.css';

const PAGE_SIZE = 8;

export function Monitores() {
  const navigate = useNavigate();
  const [monitores, setMonitores] = useState<MonitorItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMonitores(getMonitores());
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(monitores.length / PAGE_SIZE)), [monitores.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monitores.slice(start, start + PAGE_SIZE);
  }, [currentPage, monitores]);

  const emptyRowsCount = Math.max(0, PAGE_SIZE - pageItems.length);

  function handleToggleStatus(id: number) {
    const updated = toggleMonitorStatus(id);
    setMonitores(updated);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/monitores/adicionar?id=${id}`);
  }

  return (
    <section className="monitores-page" id="monitores-page">
      <div className="monitores-page__card">
        <div className="monitores-page__header">
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
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((monitor) => (
                <tr key={monitor.id}>
                  <td>{monitor.nome}</td>
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
                        onClick={() => handleToggleStatus(monitor.id)}
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
              ))}              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="monitores-page__row--empty" aria-hidden="true">
                  <td colSpan={3}>&nbsp;</td>
                </tr>
              ))}            </tbody>
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
    </section>
  );
}


