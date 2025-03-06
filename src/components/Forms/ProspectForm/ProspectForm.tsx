import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  SelectChangeEvent,
  CircularProgress,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Prospecto } from '../../../types/Prospecto';
import styles from './ProspectForm.module.css';
import AsyncSelect from '../../../components/AsyncSelect/AsyncSelect';
import { getUsers } from '../../../services/apiService';


interface ProspectFormProps {
  onSubmit: (data: Omit<Prospecto, 'id'>) => void;
  onCancel: () => void;
}

// Función para convertir string o Date a Date
const stringToDate = (value: string | Date | null | undefined): Date | null => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

// Modelo de datos inicial vacío para un nuevo prospecto
const emptyProspectData: Omit<Prospecto, 'id'> = {
  nombreCliente: '',
  contacto: '',
  oficial: '',
  referente: '',
  tipoCliente: '',
  ultimoContacto: null,
  tipoAccion: '',
  fechaVencimiento: null,
  numComitente: '',
  yaEsCliente: false,
  tipoClienteAccion: '',
  activo: '',
  notas: ''
};

export const ProspectForm: React.FC<ProspectFormProps> = ({
  onSubmit,
  onCancel
}) => {
  // Estados para manejar el formulario
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado principal del formulario - Siempre empezamos con un formulario vacío
  const [formData, setFormData] = useState<Omit<Prospecto, 'id'>>(emptyProspectData);

  // Efecto para verificar que no haya ID en los datos
  useEffect(() => {
    // Verificación de seguridad para asegurarnos que no hay ID
    if ('id' in formData) {
      console.error('ADVERTENCIA: Se detectó un ID en formData cuando no debería haberlo');
      console.log('Contenido de formData:', formData);

      // Limpiar el ID
      const cleanData = { ...formData };
      delete (cleanData as any).id;
      setFormData(cleanData);
    }
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof Prospecto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambios en los campos de selección
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    handleChange(name as keyof Prospecto, value);
  };

  // Enviar formulario - Modificado para prevenir envíos duplicados
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prevenir múltiples envíos
    if (isSubmitting || formSubmitted) {
      console.warn('Formulario ya fue enviado, ignorando este envío adicional');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Asegurar que no hay ID
      const cleanData = { ...formData };
      if ('id' in cleanData) {
        console.warn('⚠️ Se detectó un ID en los datos de creación, eliminándolo...');
        delete (cleanData as any).id;
      }

      // Marcar que el formulario ya fue enviado
      setFormSubmitted(true);

      console.log('Enviando datos del formulario:', cleanData);

      // Solo llamar onSubmit si no hemos enviado previamente
      onSubmit(cleanData);
    } catch (err) {
      console.error('Error al guardar el prospecto:', err);
      setError('Error al guardar los datos. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
      // En caso de error, permitir intentar nuevamente
      setFormSubmitted(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper elevation={0} className={styles.formContainer}>
        {error && (
          <div className={styles.errorMessage}>
            <Typography color="error">{error}</Typography>
          </div>
        )}

        {formSubmitted && !error && (
          <div className={styles.successMessage}>
            <Typography color="primary">Datos enviados correctamente</Typography>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Información Principal
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre del Cliente"
                placeholder="Nombre del prospecto"
                fullWidth
                value={formData.nombreCliente || ''}
                onChange={(e) => handleChange('nombreCliente', e.target.value)}
                required
                variant="outlined"
                size="small"
                disabled={isSubmitting || formSubmitted}
                InputProps={{
                  className: styles.inputField
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contacto"
                placeholder="Información de contacto"
                fullWidth
                value={formData.contacto || ''}
                onChange={(e) => handleChange('contacto', e.target.value)}
                required
                variant="outlined"
                size="small"
                disabled={isSubmitting || formSubmitted}
                InputProps={{
                  className: styles.inputField
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AsyncSelect
                label="Oficial"
                value={formData.oficial || ''}
                onChange={(newValue) => handleChange('oficial', newValue)}
                required
                fetchOptions={getUsers}
                disabled={isSubmitting || formSubmitted}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AsyncSelect
                label="Referente"
                value={formData.referente || ''}
                onChange={(newValue) => handleChange('referente', newValue)}
                required
                fetchOptions={getUsers}
                disabled={isSubmitting || formSubmitted}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Tipo de Cliente"
                name="tipoCliente"
                value={formData.tipoCliente || ''}
                onChange={(e) => handleChange('tipoCliente', e.target.value)}
                required
                disabled={isSubmitting || formSubmitted}
                fullWidth
                variant="outlined"
                size="small"
                className={styles.inputField}
              />
            </Grid>


            <Grid item xs={12} md={6}>
              <DatePicker
                label="Último Contacto"
                value={stringToDate(formData.ultimoContacto)}
                onChange={(date) => handleChange('ultimoContacto', date)}
                disabled={isSubmitting || formSubmitted}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small',
                    InputProps: {
                      className: styles.inputField,
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />
            </Grid>
          </Grid>

          <div className={styles.formActions}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || formSubmitted}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" style={{ marginRight: '8px' }} />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProspectForm;