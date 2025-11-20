/**
 * Pagination Component
 * Displays page navigation controls
 */

'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPageNumber } from '@/store/slices/gamesSlice';
import styles from './Pagination.module.scss';

export default function Pagination() {
  const dispatch = useAppDispatch();
  const { pageNumber, pageSize, totalCount } = useAppSelector(
    (state) => state.games
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 || totalCount === 0) {
    return null;
  }

  // Calculate page range to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (pageNumber > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (pageNumber < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== pageNumber) {
      dispatch(setPageNumber(newPage));
      // Scroll to top of games list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={styles.pagination} aria-label="Games pagination">
      <div className={styles.paginationInfo}>
        Showing {((pageNumber - 1) * pageSize) + 1} - {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} games
      </div>
      
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageButton} ${
                  pageNum === pageNumber ? styles.active : ''
                }`}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === pageNumber ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.pageButton}
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}

