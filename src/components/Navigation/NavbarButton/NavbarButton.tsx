import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavbarButton.module.css';

/** Interfaz para cada ítem del menú */
export interface NavItem {
  id: number;
  text: string;
  link?: string;
  icon?: string;
  subItems?: NavItem[];
}

interface NavbarButtonProps {
  item: NavItem;
  isCollapsed?: boolean;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({ item, isCollapsed = false }) => {
  const { text, link, subItems, icon = "/icon.svg" } = item;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const hasSubItems = subItems && subItems.length > 0;
  
  // Verifica si este ítem está activo o si alguno de sus subítems está activo
  // Excluir marcado de Home excepto en la página exacta de home
  const isActiveLink = link && 
                      ((link === '/home' || link === '/') ? 
                        (location.pathname === link) : 
                        location.pathname.includes(link));
  
  const hasActiveChild = hasSubItems && subItems?.some(
    sub => sub.link && location.pathname.includes(sub.link)
  );
  
  const isActive = isActiveLink || hasActiveChild;

  // Auto-expandir submenús si el elemento o alguno de sus hijos está activo
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive, location.pathname]);

  // Alternar submenú al hacer clic
  const toggleSubMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (hasSubItems) {
    // Ítem con submenú (ej. CRM)
    return (
      <div className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
        <div 
          className={`${styles.navItemTitle} ${isCollapsed ? styles.collapsedTitle : ''} ${isActive ? styles.active : ''}`} 
          onClick={toggleSubMenu}
        >
          <img className={styles.icon} alt="" src={icon} />
          <span className={`${styles.text} ${isCollapsed ? styles.hidden : ''}`}>{text}</span>
        </div>
        
        {/* Mostrar submenú si está abierto y no está colapsado */}
        {isOpen && !isCollapsed && (
          <div className={styles.subMenu}>
            {subItems.map(sub => (
              <NavbarButton 
                key={sub.id} 
                item={sub}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    // Ítem final sin submenú
    return (
      <Link 
        to={link || '#'} 
        className={`${styles.navbarButton} ${isCollapsed ? styles.collapsed : ''} ${isActive ? styles.active : ''}`}
      >
        <img className={styles.icon} alt="" src={icon} />
        <span className={`${styles.text} ${isCollapsed ? styles.hidden : ''}`}>{text}</span>
      </Link>
    );
  }
};

export default NavbarButton;