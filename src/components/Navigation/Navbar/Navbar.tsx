import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

// Ajusta la ruta a tu JSON real
import navbarData from '../../../data/menu';

// Importa el componente que maneja ítems (submenús)
import NavbarButton, { NavItem } from '../NavbarButton/NavbarButton';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  // Controla si el menú está expandido (true) o colapsado (false)
  const [isOpen, setIsOpen] = useState(true);
  
  // Controla si está "pineado" (el usuario hizo click para fijarlo)
  const [isPinned, setIsPinned] = useState(false);
  
  // Timer para delay de cierre
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Función para verificar si hay subelementos activos
  const checkActiveSubmenus = (items: NavItem[]): boolean => {
    for (const item of items) {
      // Si este ítem tiene la ruta actual
      if (item.link && location.pathname.includes(item.link) && 
          item.link !== '/home' && item.link !== '/') { // Excluir home
        return true;
      }
      
      // Si tiene subítems, verificarlos recursivamente
      if (item.subItems && item.subItems.length > 0) {
        const hasActiveChild = checkActiveSubmenus(item.subItems);
        if (hasActiveChild) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar rutas activas al cargar o cambiar de ruta
  useEffect(() => {
    const hasActive = checkActiveSubmenus(navbarData);
    // No hacemos nada extra aquí - no forzamos la expansión
  }, [location.pathname]);

  // Manejador para click en el toggle
  const handleToggleClick = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setIsPinned(newIsOpen); // Si lo estamos abriendo, pinear; si lo estamos cerrando, despinear
  };

  // Hover entra => abrir si NO está pineado y detenerse si hay timer
  const handleMouseEnter = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  // Hover sale => cerrar después de delay si NO está pineado
  const handleMouseLeave = () => {
    if (!isPinned) {
      const newTimer = setTimeout(() => {
        setIsOpen(false);
      }, 300); // Delay para no cerrar inmediatamente
      
      setTimer(newTimer);
    }
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  // Clases dinámicas: .navbar + .open o .closed
  const navbarClasses = `${styles.navbar} ${isOpen ? styles.open : styles.closed}`;

  return (
    <nav 
      className={navbarClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.navbarHeader}>
        {/* Logo */}
        <img 
          src="/menu-act.svg"
          alt="Logo"
          className={styles.logo}
        />
      </div>

      {/* Contenedor de ítems */}
      <div className={styles.navbarMenu}>
        {navbarData.map((item: NavItem) => (
          <NavbarButton 
            key={item.id} 
            item={item} 
            isCollapsed={!isOpen}
          />
        ))}
      </div>
      
      {/* Footer con texto */}
      <div className={styles.navbarFooter}>
        {isOpen ? "ACQ DS" : "ACQ"}
      </div>
    </nav>
  );
};

export default Navbar;