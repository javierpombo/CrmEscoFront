import React, { useState, useEffect, useRef } from 'react';
import styles from './FilterDropdown.module.css';

// Interfaz para las opciones de filtro con soporte para anidamiento
export interface FilterOption {
  id: string;
  name: string;
  icon?: string;  // Opcional para mayor flexibilidad
  children?: FilterOption[];  // Submenú de opciones
}

// Props del componente con opciones de personalización
interface FilterDropdownProps {
  // Callback cuando se selecciona un filtro
  onFilterSelect: (filterId: string, parentId?: string) => void;
  // Opciones de filtro a mostrar
  options?: FilterOption[];
  // Texto del botón (opcional, por defecto "Filtros")
  buttonText?: string;
  // Icono del botón (opcional)
  buttonIcon?: string;
  // Ancho personalizado (opcional)
  width?: string | number;
  // Posición del menú (opcional, por defecto "left")
  menuPosition?: 'left' | 'right' | 'center';
  // Clase CSS adicional (opcional)
  className?: string;
  // Icono para indicar expansión (opcional)
  expandIcon?: string;
  // Icono para cada opción (opcional)
  nextIcon?: string;
  // Altura máxima del menú (opcional)
  maxHeight?: string | number;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  onFilterSelect,
  options = [],
  buttonText = "Filtros",
  buttonIcon = "/icon-11.svg",
  width,
  menuPosition = "left",
  className = "",
  expandIcon = "/icon-12.svg",
  nextIcon = "/icon-12.svg",
  maxHeight = "none"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [currentSelection, setCurrentSelection] = useState<string>(buttonText);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Si no se proporcionan opciones, usar opciones por defecto
  const defaultOptions: FilterOption[] = [
    { id: 'sector', name: 'Sector', icon: '/sector-icon.svg' },
    { id: 'oficial', name: 'Oficial', icon: '/person-icon.svg' },
    { id: 'referente', name: 'Referente', icon: '/person-icon.svg' }
  ];

  const filterOptions = options.length > 0 ? options : defaultOptions;

  useEffect(() => {
    // Cerrar el dropdown cuando se hace clic fuera del componente
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedParentId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedParentId(null);
    }
  };

  const handleParentClick = (parentId: string) => {
    setSelectedParentId(parentId);
  };

  const handleOptionClick = (filterId: string, optionName: string, parentId?: string) => {
    if (parentId) {
      onFilterSelect(filterId, parentId);
      // Actualizar el texto del botón para reflejar la selección actual
      const parentOption = filterOptions.find(opt => opt.id === parentId);
      setCurrentSelection(`${parentOption?.name || buttonText}: ${optionName}`);
    } else {
      onFilterSelect(filterId);
      // Si no tiene parent, simplemente actualizar con el nombre de la opción
      setCurrentSelection(`${buttonText}: ${optionName}`);
    }
    setIsOpen(false);
    setSelectedParentId(null);
  };

  // Estilo para ancho personalizado si se especifica
  const customStyle = width ? { width } : {};
  
  // Clase para posicionamiento del menú
  const menuPositionClass = styles[`menu${menuPosition.charAt(0).toUpperCase() + menuPosition.slice(1)}`];

  // Estilo para altura máxima del menú
  const menuStyle = maxHeight !== 'none' ? { maxHeight } : {};

  return (
    <div 
      className={`${styles.filterDropdown} ${className}`} 
      ref={dropdownRef}
      style={customStyle}
    >
      <button className={styles.filterButton} onClick={toggleDropdown}>
        <div className={styles.buttonContent}>
          {buttonIcon && (
            <img className={styles.icon} src={buttonIcon} alt="Filter icon" />
          )}
          <span className={styles.text}>{currentSelection}</span>
        </div>
        <img 
          className={`${styles.icon} ${isOpen ? styles.rotated : ''}`} 
          src={expandIcon} 
          alt="Expand" 
        />
      </button>
      
      {isOpen && (
        <div 
          className={`${styles.dropdownMenu} ${menuPositionClass}`}
          style={menuStyle}
        >
          {selectedParentId === null ? (
            // Mostrar el menú principal
            filterOptions.map((option) => (
              <div
                key={option.id}
                className={styles.dropdownItem}
                onClick={() => option.children && option.children.length > 0 
                  ? handleParentClick(option.id) 
                  : handleOptionClick(option.id, option.name)}
              >
                {option.icon && (
                  <img className={styles.icon} src={option.icon} alt={option.name} />
                )}
                <span className={styles.itemText}>{option.name}</span>
                {option.children && option.children.length > 0 && (
                  <img 
                    className={`${styles.icon} ${styles.nextIcon}`} 
                    src={nextIcon} 
                    alt="Next" 
                  />
                )}
              </div>
            ))
          ) : (
            // Mostrar el submenú de la opción seleccionada
            <>
              <div 
                className={`${styles.dropdownItem} ${styles.backItem}`}
                onClick={() => setSelectedParentId(null)}
              >
                <img 
                  className={`${styles.icon} ${styles.backIcon}`} 
                  src="/flecha-izq.png" 
                  alt="Back" 
                />
                <span className={styles.itemText}>Volver</span>
              </div>
              
              {filterOptions
                .find(option => option.id === selectedParentId)
                ?.children?.map((childOption) => (
                  <div
                    key={childOption.id}
                    className={styles.dropdownItem}
                    onClick={() => handleOptionClick(childOption.id, childOption.name, selectedParentId)}
                  >
                    {childOption.icon && (
                      <img className={styles.icon} src={childOption.icon} alt={childOption.name} />
                    )}
                    <span className={styles.itemText}>{childOption.name}</span>
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;