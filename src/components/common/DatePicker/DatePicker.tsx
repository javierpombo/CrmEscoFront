import React from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) => {
  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns}
    >
      <DatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        slots={{
          textField: TextField
        }}
        slotProps={{
          textField: {
            helperText: error,
            required,
            error: !!error,
            fullWidth: true,
          }
        }}
        format="dd/MM/yyyy"
      />
    </LocalizationProvider>
  );
};