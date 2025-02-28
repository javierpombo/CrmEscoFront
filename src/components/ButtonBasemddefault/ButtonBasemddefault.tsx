import React from 'react';
import styles from './ButtonBasemddefault.module.css';

interface ButtonBasemddefaultProps {
  showButtonBasemddefault?: boolean;
  text?: string;
  onClick?: () => void;
  buttonBasemddefaultBackgroundColor?: string;
  buttonBasemddefaultWidth?: string;
  buttonBasemddefaultAlignSelf?: string;
  textTextDecoration?: string;
  textColor?: string;
  textHeight?: string;
  textWidth?: string;
  textDisplay?: string;
}

const ButtonBasemddefault: React.FC<ButtonBasemddefaultProps> = ({ 
  showButtonBasemddefault = true,
  text = 'Button', 
  onClick,
  buttonBasemddefaultBackgroundColor = '#0885e6',
  buttonBasemddefaultWidth = '110px',
  buttonBasemddefaultAlignSelf = 'unset',
  textTextDecoration = 'none',
  textColor = '#fefefe',
  textHeight = '30px',
  textWidth = '46px',
  textDisplay = 'inline-block'
}) => {
  if (!showButtonBasemddefault) return null;

  return (
    <button
      className={styles.buttonBasemddefault}
      onClick={onClick}
      style={{
        backgroundColor: buttonBasemddefaultBackgroundColor,
        width: buttonBasemddefaultWidth,
        alignSelf: buttonBasemddefaultAlignSelf
      }}
    >
      <span 
        className={styles.text}
        style={{
          textDecoration: textTextDecoration,
          color: textColor,
          height: textHeight,
          width: textWidth,
          display: textDisplay
        }}
      >
        {text}
      </span>
    </button>
  );
};

export default ButtonBasemddefault;