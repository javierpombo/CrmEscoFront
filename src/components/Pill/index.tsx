import React from 'react';
import styles from './Pill.module.css';

interface PillProps {
  property1?: string;
  property2?: string;
  property3?: string;
  property4?: 'Primary' | 'Error' | 'Warning' | 'Gray' | 'Success';
}

const Pill: React.FC<PillProps> = ({ 
  property1 = 'Pill',
  property2 = 'Text',
  property3 = 'Small',
  property4 = 'Gray'
}) => {
  return (
    <div 
      className={styles.root}
      data-property1={property1}
      data-property2={property2}
      data-property3={property3}
      data-property4={property4}
    >
      <div 
        className={styles.pillBase}
        style={{
          backgroundColor: 
            property4 === 'Primary' ? 'rgba(8, 133, 230, 0.1)' :
            property4 === 'Error' ? 'rgba(244, 67, 54, 0.1)' :
            property4 === 'Warning' ? 'rgba(255, 152, 0, 0.1)' :
            'rgba(158, 158, 158, 0.1)'
        }}
      >
        <span 
          className={styles.optionsDefaultLabel}
          style={{
            color: 
              property4 === 'Primary' ? '#0885e6' :
              property4 === 'Error' ? '#F44336' :
              property4 === 'Warning' ? '#FF9800' :
              '#9E9E9E'
          }}
        >
          {property4}
        </span>
      </div>
    </div>
  );
};

export default Pill;