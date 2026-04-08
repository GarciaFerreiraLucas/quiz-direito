import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconeAdicionar from '../../assets/icones/icone_adicionar.svg';
import iconeAtivar from '../../assets/icones/icone_ativar.svg';
import iconeInativar from '../../assets/icones/icone_inativar.svg';
import iconeEditar from '../../assets/icones/icone_editar.svg';
import { getCadastroItems, toggleCadastroStatus } from '../../utils/cadastroStore';
import type { CadastroItem } from '../../utils/cadastroStore';
import { TablePagination } from '../../components/Pagination';
import './Categorias.css';

const PAGE_SIZE = 8;

export function Categorias() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CadastroItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setItems(getCadastroItems('categorias'));
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
    const updated = toggleCadastroStatus('categorias', id);
    setItems(updated);
  }

  function goToEdit(id: number) {
    navigate(`/dashboard/categorias/adicionar?id=${id}`);
  }

  return (
    <section className="categorias-list-page" id="categorias-page">
      <div className="categorias-list-page__card">
        <div className="categorias-list-page__header">
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
                        onClick={() => handleToggleStatus(item.id)}
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
              ))}              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-row-${index}`} className="categorias-list-page__row--empty" aria-hidden="true">
                  <td colSpan={4}>&nbsp;</td>
                </tr>
              ))}            </tbody>
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
    </section>
  );
}


