import React from 'react';
import { Modal as MUIModal, Box, Typography } from '@mui/material';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number | string;
  fullWidth?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 900,
  fullWidth = false,
  className = ''
}) => {
  return (
    <MUIModal
      open={open}
      onClose={onClose}
      aria-labelledby="generic-modal-title"
      className={`${styles.modal} ${className}`}
    >
      <Box 
        className={styles.modalContent}
        sx={{ 
          maxWidth: fullWidth ? '100%' : maxWidth,
          width: fullWidth ? '100%' : 'auto'
        }}
      >
        {title && (
          <div className={styles.modalHeader}>
            <Typography 
              id="generic-modal-title" 
              variant="h6" 
              component="h2"
            >
              {title}
            </Typography>
          </div>
        )}

        <div className={styles.modalBody}>
          {children}
        </div>
      </Box>
    </MUIModal>
  );
};