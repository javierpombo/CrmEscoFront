
import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="#" className={styles.acqData}>ACQ | Data scope</a>
        <div className={styles.headerIcons}>
          {/* <button className={styles.icon}>
            <img src="/icon-fullscreen.svg" alt="Pantalla completa" />
          </button> */}
          {/* <button className={styles.icon}>
            <img src="/icon-dark-mode.svg" alt="Cambiar tema" />
          </button> */}
          {/* <button className={styles.icon}>
            <img src="/icon-settings.svg" alt="Configuración" />
          </button> */}
          <div className={styles.avatarIcon}>
            <img src="/avatar.svg" alt="Usuario" width="36" height="36" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;