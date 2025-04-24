import React, { useMemo } from 'react';
import './ActiveFilterChips.css';

/**
 * Interfaz para un filtro individual
 */
export interface FilterItem {
  id: string;          // Identificador único del filtro
  type: string;        // Tipo de filtro (categoría)
  label: string;       // Texto a mostrar
  color?: string;      // Color opcional (si no se proporciona, se asignará aleatoriamente)
}

/**
 * Propiedades del componente ActiveFilterChips
 */
interface ActiveFilterChipsProps {
  filters: FilterItem[];                             // Array de filtros activos
  onRemoveFilter: (id: string, type: string) => void; // Callback para eliminar un filtro
  className?: string;                                // Clase CSS adicional
}

/**
 * Componente para mostrar filtros activos como chips con colores aleatorios
 */
const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  className = ''
}) => {
  // Lista de colores disponibles
  const availableColors = [
    'blue', 'orange', 'red', 'green', 'purple', 'indigo', 
    'teal', 'cyan', 'pink', 'amber', 'deeporange', 'brown',
    'deeppurple', 'lightblue', 'lightgreen', 'lime', 'yellow', 'gray'
  ];

  // Asignar colores aleatorios a los filtros que no tienen color
  const filtersWithColors = useMemo(() => {
    return filters.map(filter => {
      if (filter.color) return filter;
      
      // Asignar un color aleatorio
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      return {
        ...filter,
        color: availableColors[randomIndex]
      };
    });
  }, [filters]);

  // Si no hay filtros, no mostrar nada
  if (!filtersWithColors || filtersWithColors.length === 0) {
    return null;
  }

  return (
    <div className={`clean-filters-container ${className}`}>
      <div className="clean-filters-chips">
        {filtersWithColors.map((filter) => (
          <div
            key={`${filter.type}-${filter.id}`}
            className={`clean-filter-chip ${filter.color ? `clean-filter-chip-${filter.color}` : 'clean-filter-chip-default'}`}
          >
            <span className="clean-filter-chip-label">{filter.label}</span>
            <button
              className="clean-filter-chip-remove"
              onClick={() => onRemoveFilter(filter.id, filter.type)}
              aria-label={`Eliminar filtro ${filter.label}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilterChips;