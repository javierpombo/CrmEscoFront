import React, { useState, useEffect } from 'react';
import { Button, Popover, Box, Typography } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { es } from 'date-fns/locale';
import { format, isAfter, isBefore, isValid, isSameDay } from 'date-fns';
import styles from './ImprovedDateRangePicker.module.css';

interface ImprovedDateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  buttonLabel?: string;
  clearLabel?: string;
  applyLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

// Componente personalizado para los días del calendario
interface CustomDayProps extends PickersDayProps<Date> {
  startDate: Date | null;
  endDate: Date | null;
}

// Componente de día personalizado
const CustomDay = (props: CustomDayProps) => {
  const { day, startDate, endDate, ...other } = props;
  
  // Verificar si es el primer día, último día o está dentro del rango
  let isFirstDay = false;
  let isLastDay = false;
  let isInRange = false;

  if (startDate && endDate) {
    isFirstDay = isSameDay(day, startDate);
    isLastDay = isSameDay(day, endDate);
    
    // Si no es ni el primer ni el último día, verificar si está dentro del rango
    if (!isFirstDay && !isLastDay) {
      // Comprueba manualmente si el día está dentro del rango en lugar de usar isWithinInterval
      const dayTime = day.getTime();
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      
      // Asegurarnos de que startTime sea realmente menor que endTime
      const minTime = Math.min(startTime, endTime);
      const maxTime = Math.max(startTime, endTime);
      
      isInRange = dayTime > minTime && dayTime < maxTime;
    }
  } else if (startDate) {
    isFirstDay = isSameDay(day, startDate);
  } else if (endDate) {
    isLastDay = isSameDay(day, endDate);
  }

  // Aplicar clases CSS según la posición del día
  let className = '';
  if (isFirstDay) {
    className = `${styles.firstDay}`;
  } else if (isLastDay) {
    className = `${styles.lastDay}`;
  } else if (isInRange) {
    className = `${styles.dayInRange}`;
  }

  return (
    <PickersDay
      {...other}
      day={day}
      className={className ? `${className} ${other.className || ''}` : other.className}
      sx={{
        ...(isFirstDay && {
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
          backgroundColor: '#1976d2 !important',
          color: '#fff !important',
        }),
        ...(isLastDay && {
          borderTopRightRadius: '50%',
          borderBottomRightRadius: '50%',
          backgroundColor: '#1976d2 !important',
          color: '#fff !important',
        }),
        ...(isInRange && {
          backgroundColor: 'rgba(25, 118, 210, 0.1) !important',
          borderRadius: 0,
        }),
      }}
    />
  );
};

const ImprovedDateRangePicker: React.FC<ImprovedDateRangePickerProps> = ({
  onDateRangeChange,
  buttonLabel = "Filtrar por fecha",
  clearLabel = "Limpiar",
  applyLabel = "Aplicar",
  startPlaceholder = "Desde",
  endPlaceholder = "Hasta",
  initialStartDate = null,
  initialEndDate = null
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(initialEndDate);
  const [selectingStart, setSelectingStart] = useState<boolean>(true);
  const [displayRange, setDisplayRange] = useState<string>("");

  // Actualizar el texto de visualización cuando cambian las fechas
  useEffect(() => {
    updateDisplayRange();
  }, [startDate, endDate]);

  // Inicializar con fechas iniciales si se proporcionan
  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setTempStartDate(initialStartDate);
    setTempEndDate(initialEndDate);
    updateDisplayRange();
  }, [initialStartDate, initialEndDate]);

  const updateDisplayRange = () => {
    if (startDate && endDate) {
      setDisplayRange(`${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`);
    } else if (startDate) {
      setDisplayRange(`${format(startDate, 'dd/MM/yyyy')} - ${endPlaceholder}`);
    } else if (endDate) {
      setDisplayRange(`${startPlaceholder} - ${format(endDate, 'dd/MM/yyyy')}`);
    } else {
      setDisplayRange("");
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Inicializar fechas temporales con las actuales
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    // Si no hay fechas seleccionadas, empezamos seleccionando la fecha de inicio
    setSelectingStart(!tempStartDate);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Revertir a los valores originales si se cierra sin aplicar
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  const handleDateSelection = (date: Date | null) => {
    if (!date || !isValid(date)) return;
    
    if (selectingStart) {
      // Si estamos seleccionando la fecha de inicio
      setTempStartDate(date);
      // Si la fecha de fin existe y es anterior a la nueva fecha de inicio, la borramos
      if (tempEndDate && isAfter(date, tempEndDate)) {
        setTempEndDate(null);
      }
      setSelectingStart(false);
    } else {
      // Si estamos seleccionando la fecha de fin
      if (tempStartDate && isAfter(date, tempStartDate)) {
        setTempEndDate(date);
      } else {
        // Si la fecha de fin es anterior a la de inicio, intercambiamos
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    // Aplicamos los cambios temporales a los valores reales
    if (tempStartDate && tempEndDate && isAfter(tempStartDate, tempEndDate)) {
      // Asegurarnos de que tempStartDate sea siempre más temprano que tempEndDate
      const temp = tempStartDate;
      setStartDate(tempEndDate);
      setEndDate(temp);
      onDateRangeChange(tempEndDate, temp);
    } else {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      onDateRangeChange(tempStartDate, tempEndDate);
    }
    handleClose();
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectingStart(true);
  };

  const handleClearAndApply = () => {
    setStartDate(null);
    setEndDate(null);
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectingStart(true);
    setDisplayRange("");
    onDateRangeChange(null, null);
    handleClose();
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClearAndApply();
  };

  // Definir el componente de día personalizado
  const CustomDayComponent = React.forwardRef<HTMLButtonElement, PickersDayProps<Date>>((props, ref) => {
    return <CustomDay {...props} startDate={tempStartDate} endDate={tempEndDate} ref={ref} />;
  });

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <div className={styles.container}>
      {/* Botón principal con tamaño fijo para evitar cambios de posición */}
      <Button
        aria-describedby={id}
        variant="outlined"
        onClick={handleClick}
        startIcon={<CalendarTodayIcon />}
        className={styles.dateButton}
        sx={{
          height: '44px',
          minWidth: '220px', // Tamaño fijo para evitar cambios de posición
          maxWidth: '280px',
          borderColor: '#e7e7e7',
          color: '#777',
          textTransform: 'none',
          padding: '6px 16px',
          justifyContent: 'space-between',
          '&:hover': {
            borderColor: '#c7c7c7',
            backgroundColor: '#f9f9f9',
          }
        }}
      >
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          overflow: 'hidden'
        }}>
          <Typography 
            noWrap 
            sx={{ 
              flex: 1, 
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {displayRange || buttonLabel}
          </Typography>
          
          {/* Usamos Box en lugar de IconButton para evitar el botón anidado */}
          {displayRange && (
            <Box 
              component="span"
              onClick={handleClearClick}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                cursor: 'pointer',
                ml: 1,
                p: '4px',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: '#666'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          )}
        </Box>
      </Button>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '.MuiPopover-paper': {
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '8px',
          }
        }}
      >
        <div className={styles.popoverContent}>
          <div className={styles.selectionStatus}>
            {selectingStart ? (
              <div className={styles.statusText}>Seleccione fecha inicial</div>
            ) : (
              <div className={styles.statusText}>Seleccione fecha final</div>
            )}
            <div className={styles.rangeDisplay}>
              {tempStartDate ? (
                <span className={styles.dateDisplay}>{format(tempStartDate, 'dd/MM/yyyy')}</span>
              ) : (
                <span className={styles.placeholder}>{startPlaceholder}</span>
              )}
              <span className={styles.separator}>-</span>
              {tempEndDate ? (
                <span className={styles.dateDisplay}>{format(tempEndDate, 'dd/MM/yyyy')}</span>
              ) : (
                <span className={styles.placeholder}>{endPlaceholder}</span>
              )}
            </div>
          </div>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DateCalendar 
              value={selectingStart ? tempStartDate : tempEndDate} 
              onChange={handleDateSelection}
              slots={{
                day: CustomDayComponent
              }}
              sx={{
                width: '320px',
                '.MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
                '.MuiPickersDay-root:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                },
                '.MuiPickersDay-root.Mui-selected:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            />
          </LocalizationProvider>
          
          <div className={styles.actionButtons}>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              sx={{ 
                textTransform: 'none', 
                borderColor: '#e0e0e0',
                color: '#666',
                '&:hover': {
                  borderColor: '#bdbdbd',
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              {clearLabel}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleApply}
              disabled={!(tempStartDate || tempEndDate)}
              sx={{ 
                textTransform: 'none',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
            >
              {applyLabel}
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ImprovedDateRangePicker;