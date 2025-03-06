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
  activo: 'activo',
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
              <FormControl fullWidth size="small">
                <InputLabel>Oficial</InputLabel>
                <Select
                  name="oficial"
                  value={formData.oficial || ''}
                  label="Oficial"
                  onChange={handleSelectChange}
                  required
                  disabled={isSubmitting || formSubmitted}
                  className={styles.selectField}
                >
                  <MenuItem value=""><em>Seleccionar</em></MenuItem>
                  <MenuItem value="Oficial 1">Oficial 1</MenuItem>
                  <MenuItem value="Oficial 2">Oficial 2</MenuItem>
                  <MenuItem value="Oficial 3">Oficial 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Referente</InputLabel>
                <Select
                  name="referente"
                  value={formData.referente || ''}
                  label="Referente"
                  onChange={handleSelectChange}
                  required
                  disabled={isSubmitting || formSubmitted}
                  className={styles.selectField}
                >
                  <MenuItem value=""><em>Seleccionar</em></MenuItem>
                  <MenuItem value="Referente 1">Referente 1</MenuItem>
                  <MenuItem value="Referente 2">Referente 2</MenuItem>
                  <MenuItem value="Referente 3">Referente 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Cliente</InputLabel>
                <Select
                  name="tipoCliente"
                  value={formData.tipoCliente || ''}
                  label="Tipo de Cliente"
                  onChange={handleSelectChange}
                  required
                  disabled={isSubmitting || formSubmitted}
                  className={styles.selectField}
                >
                  <MenuItem value=""><em>Seleccionar</em></MenuItem>
                  <MenuItem value="Particular">Particular</MenuItem>
                  <MenuItem value="Empresa">Empresa</MenuItem>
                  <MenuItem value="Institucional">Institucional</MenuItem>
                </Select>
              </FormControl>
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
            
            {/* <Grid item xs={12}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Información Adicional
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Tipo de Acción"
                placeholder="Tipo de acción pendiente"
                fullWidth
                value={formData.tipoAccion || ''}
                onChange={(e) => handleChange('tipoAccion', e.target.value)}
                variant="outlined"
                size="small"
                disabled={isSubmitting || formSubmitted}
                InputProps={{
                  className: styles.inputField
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Vencimiento"
                value={stringToDate(formData.fechaVencimiento)}
                onChange={(date) => handleChange('fechaVencimiento', date)}
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

            <Grid item xs={12} md={6}>
              <TextField
                label="Número de Comitente"
                placeholder="Número de comitente"
                fullWidth
                value={formData.numComitente || ''}
                onChange={(e) => handleChange('numComitente', e.target.value)}
                variant="outlined"
                size="small"
                disabled={isSubmitting || formSubmitted}
                InputProps={{
                  className: styles.inputField
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.yaEsCliente || false}
                    onChange={(e) => handleChange('yaEsCliente', e.target.checked)}
                    disabled={isSubmitting || formSubmitted}
                    color="primary"
                  />
                }
                label="¿Ya es cliente?"
                className={styles.checkboxField}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas"
                placeholder="Información adicional"
                multiline
                rows={3}
                fullWidth
                value={formData.notas || ''}
                onChange={(e) => handleChange('notas', e.target.value)}
                variant="outlined"
                disabled={isSubmitting || formSubmitted}
                InputProps={{
                  className: styles.textareaField
                }}
              />
            </Grid> */}
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