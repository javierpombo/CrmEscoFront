import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;             // Página actual
  totalPages: number;             // Número total de páginas
  onPageChange: (page: number) => void; // Callback para cambiar de página
  className?: string;             // Clase opcional para estilos adicionales
}

/**
 * Retorna un arreglo con los números (o '...') que deben renderizarse.
 * - Muestra todas las páginas si totalPages ≤ 10.
 * - Muestra un rango + '...' si totalPages > 10.
 */
const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];

  // Caso simple: <= 10 páginas
  if (totalPages <= 10) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Caso muchas páginas:
  const firstPage = 1;
  const lastPage = totalPages;
  const range = 2; // cuántas páginas a izq/der de la actual
  // Añadimos la 1
  pages.push(firstPage);

  // Calculamos el inicio y fin del rango alrededor de currentPage
  let start = currentPage - range;
  let end = currentPage + range;

  // Ajuste para no pasarnos del límite inferior
  if (start <= 2) {
    start = 2;
  }
  // Ajuste para no pasarnos del límite superior
  if (end >= (lastPage - 1)) {
    end = lastPage - 1;
  }

  // Agregamos '...' si start > 2
  if (start > 2) {
    pages.push('...');
  }

  // Agregar las páginas del rango
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Agregamos '...' si end < lastPage - 1
  if (end < (lastPage - 1)) {
    pages.push('...');
  }

  // Agregamos la última página
  pages.push(lastPage);

  return pages;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Botón Anterior */}
      <button
        className={styles.button}
        onClick={handlePrevClick}
        disabled={currentPage === 1}
      >
        <div className={styles.buttonBase}>
          <img className={styles.icon} alt="icon-prev" src="/flecha-izq.png" />
          <div className={styles.pageLabel}>Anterior</div>
        </div>
      </button>

      <div className={styles.paginationNumbers}>
        {pageNumbers.map((page, idx) => {
          if (typeof page === 'number') {
            const isActive = page === currentPage;
            return (
              <button
                key={idx}
                onClick={() => handlePageClick(page)}
                className={
                  isActive
                    ? styles.paginationNumberBase 
                    : styles.paginationNumberBase1 
                }
              >
                <div className={styles.content}>
                  <div className={isActive ? styles.number : styles.number1}>
                    {page}
                  </div>
                </div>
              </button>
            );
          } else {
            return (
              <div key={idx} className={styles.paginationNumberBase1}>
                <div className={styles.content}>
                  <div className={styles.number1}>{page}</div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        className={styles.button}
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
      >
        <div className={styles.buttonBase}>
          <div className={styles.pageLabel}>Siguiente</div>
          <img className={styles.icon} alt="icon-next" src="/flecha-der.png" />
        </div>
      </button>
    </div>
  );
};

export default Pagination;
