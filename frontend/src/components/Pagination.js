export const ELLIPSIS_START = "ellipsis-start";
export const ELLIPSIS_END = "ellipsis-end";

const SIBLING_COUNT = 1;
const EDGE_WINDOW = 5; // page numbers shown together with a single ellipsis (e.g. 1 2 3 4 5 ... N)
const MAX_PAGES_WITHOUT_ELLIPSIS = 7;

function range(start, end) {
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

// Builds the list of page numbers/ellipsis markers to render, e.g.
// [1, 2, 3, 4, 5, ELLIPSIS_END, 24] or [1, ELLIPSIS_START, 4, 5, 6, ELLIPSIS_END, 24].
export function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return range(1, totalPages);
  }

  const nearStart = currentPage <= EDGE_WINDOW - 1;
  const nearEnd = currentPage >= totalPages - (EDGE_WINDOW - 2);

  if (nearStart) {
    return [...range(1, EDGE_WINDOW), ELLIPSIS_END, totalPages];
  }

  if (nearEnd) {
    return [1, ELLIPSIS_START, ...range(totalPages - EDGE_WINDOW + 1, totalPages)];
  }

  return [
    1,
    ELLIPSIS_START,
    currentPage - SIBLING_COUNT,
    currentPage,
    currentPage + SIBLING_COUNT,
    ELLIPSIS_END,
    totalPages,
  ];
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {pageNumbers.map((page) =>
        page === ELLIPSIS_START || page === ELLIPSIS_END ? (
          <span key={page} className="pagination-ellipsis">
            &hellip;
          </span>
        ) : (
          <button
            type="button"
            key={page}
            className={
              page === currentPage ? "pagination-page active" : "pagination-page"
            }
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
