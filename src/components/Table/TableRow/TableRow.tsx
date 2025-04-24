import React from 'react';
import styles from './TableRow.module.css';

interface TableRowProps {
  rowData: any;
}

const TableRow: React.FC<TableRowProps> = ({ rowData }) => {
  const getSectorColor = (sector: string) => {
    const sectorColors: { [key: string]: string } = {
      'Finanzas': styles.colorBlue,
      'Contabilidad': styles.colorOrange,
      'Marketing': styles.colorRed,
      'N/A': styles.colorGray
    };
    return sectorColors[sector] || styles.colorGray;
  };

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.avatar}>
          <img 
            className={styles.avatarIcon} 
            src="/avatar.png" 
            alt={rowData.nombre} 
          />
          {rowData.nombre}
        </div>
      </td>
      <td className={styles.tableCell}>
        <span className={`${styles.sectorPill} ${getSectorColor(rowData.sector)}`}>
          {rowData.sector}
        </span>
      </td>
      <td className={styles.tableCell}>{rowData.oficial}</td>
      <td className={styles.tableCell}>{rowData.referente}</td>
      <td className={styles.tableCell}>{rowData.numcomitente}</td>
      <td className={styles.tableCell}>{rowData.cuit}</td>
      <td className={styles.tableCell}>{rowData.mail}</td>
      <td className={styles.tableCell}>
        <span className={`${styles.sectorPill} ${styles.colorBlue}`}>
          Primary
        </span>
      </td>
    </tr>
  );
};

export default TableRow;