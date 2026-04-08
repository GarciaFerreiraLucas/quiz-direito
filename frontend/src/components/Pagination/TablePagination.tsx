interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className: string;
  pageNumberClassName: string;
  ariaLabel?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  pageNumberClassName,
  ariaLabel = 'Paginacao',
}: TablePaginationProps) {
  return (
    <div className={className} aria-label={ariaLabel}>
      <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(1)}>
        {'<<'}
      </button>
      <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        {'<'}
      </button>
      <button type="button" className={pageNumberClassName} aria-current="page">
        {currentPage}
      </button>
      <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        {'>'}
      </button>
      <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>
        {'>>'}
      </button>
    </div>
  );
}
