/**
 * Pagination Component
 *
 * Pagination controls for search results
 * Displays page numbers, previous/next buttons, and results info
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFiltersContext } from '../../../context/filters/useFiltersContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  itemsPerPage,
}) => {
  const { setCurrentPage } = useFiltersContext();

  if (totalPages <= 1) {
    return null;
  }

  // Calculate range of items shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  // Generate page numbers to show (max 5 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4 xs:space-y-6 mt-6 xs:mt-8">
      {/* Results info */}
      <div className="text-center text-xs xs:text-sm text-gray-400">
        Mostrando <span className="text-white font-semibold">{startItem}</span> a{' '}
        <span className="text-white font-semibold">{endItem}</span> de{' '}
        <span className="text-white font-semibold">{totalResults}</span> películas
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2 xs:gap-3">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl border border-gray-700 text-gray-300 hover:border-primary-pink hover:text-primary-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 xs:w-5 h-4 xs:h-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 xs:gap-1.5">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => handlePageClick(1)}
                className="px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl border border-gray-700 text-gray-300 hover:border-primary-pink text-xs xs:text-sm transition-all"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="text-gray-500 px-1">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl text-xs xs:text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-primary-pink border-primary-pink text-white'
                  : 'border border-gray-700 text-gray-300 hover:border-primary-pink'
              }`}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-gray-500 px-1">...</span>
              )}
              <button
                onClick={() => handlePageClick(totalPages)}
                className="px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl border border-gray-700 text-gray-300 hover:border-primary-pink text-xs xs:text-sm transition-all"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl border border-gray-700 text-gray-300 hover:border-primary-pink hover:text-primary-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 xs:w-5 h-4 xs:h-5" />
        </button>
      </div>
    </div>
  );
};
