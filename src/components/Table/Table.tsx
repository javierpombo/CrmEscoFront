import React from 'react';
import styles from './Table.module.css';

interface Column {
  label: string;
  field: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  data: any[];
  columns: Column[];
}

const Table: React.FC<TableProps> = ({ data, columns }) => {
  // Si no hay datos, mostramos un mensaje de tabla vacía
  if (data.length === 0) {
    return (
      <div className={styles.emptyTable}>
        <p>No se encontraron registros</p>
      </div>
    );
  }

  // Función para formatear el valor de una celda
  const formatCellValue = (value: any, field: string) => {
    // Formateo de campos específicos
    if (field === 'activo' && typeof value === 'boolean') {
      return (
        <span className={`${styles.statusPill} ${value ? styles.activePill : styles.inactivePill}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      );
    }

    // Para campo 'Estado' que puede ser un string "Activo"
    if (field === 'estado') {
      if (value === 'Activo' || value === 'activo') {
        return (
          <span className={`${styles.statusPill} ${styles.activePill}`}>
            Activo
          </span>
        );
      } else if (value === 'Inactivo' || value === 'inactivo') {
        return (
          <span className={`${styles.statusPill} ${styles.inactivePill}`}>
            Inactivo
          </span>
        );
      }
    }

    // Campo tipoCliente/Sector - podemos darle un estilo especial
    if (field === 'cargo_contacto' || field === 'sector') {
      return (
        <span className={`${styles.sectorPill} ${styles.colorBlue}`}>
          {value}
        </span>
      );
    }

    // Si es N/A o vacío o guión, estilo gris
    if (value === 'N/A' || value === '-' || value === '') {
      return (
        <span className={styles.naValue}>
          {value || 'N/A'}
        </span>
      );
    }

    // Para el resto de campos, devolvemos el valor tal cual
    return value;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={styles.tableHeaderCell}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.tableRow}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={styles.tableCell}>
                  {col.render
                    ? col.render(row)
                    : formatCellValue(row[col.field], col.field)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;