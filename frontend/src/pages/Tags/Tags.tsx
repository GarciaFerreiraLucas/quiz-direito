import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import { getCadastroItems, toggleCadastroStatus } from '../../utils/cadastroStore';
import type { CadastroItem } from '../../utils/cadastroStore';
import { TablePagination } from '../../components/Pagination';
import './Tags.css';

const PAGE_SIZE = 8;

export function Tags() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CadastroItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setItems(getCadastroItems('tags'));
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [currentPage, items]);

  const emptyRowsCount = Math.max(0, PAGE_SIZE - pageItems.length);

  function handleToggleStatus(id: number) {
    const updated = toggleCadastroStatus('tags', id);
    setItems(updated);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/tags/adicionar?id=${id}`);
  }

  return (
    <section className="tags-list-page" id="tags-page">
      <div className="tags-list-page__card">
        <div className="tags-list-page__header">
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
                        onClick={() => handleToggleStatus(item.id)}
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
              ))}              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="tags-list-page__row--empty" aria-hidden="true">
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              ))}            </tbody>
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
    </section>
  );
}


