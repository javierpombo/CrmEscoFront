import React from 'react';
import styles from './TableHeader.module.css';

interface TableHeaderProps {
  columns: string[]; 
  customStyles?: React.CSSProperties;
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
  columns, 
  customStyles 
}) => {
  return (
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th 
            key={index} 
            className={styles.tableHeaderCell}
            style={customStyles}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;