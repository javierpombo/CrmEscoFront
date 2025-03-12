import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Prospecto } from '../../../types/Prospecto';
import styles from './ProspectForm.module.css';

interface ProspectFormProps {
  onSubmit: (data: Omit<Prospecto, 'id'>) => void;
  onCancel: () => void;
}

// Interfaz para eventos
interface ProspectoEvent {
  id?: string | number;
  event_date: string | null;
  description: string | null;
  next_contact: string | null;
}

// Interfaz para acciones
interface ProspectoAction {
  id?: string | number;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
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
  cargo_contacto: '',
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
  const [error, setError] = useState<string | null>(null);

  // Estado principal del formulario - Siempre empezamos con un formulario vacío
  const [formData, setFormData] = useState<Omit<Prospecto, 'id'>>(emptyProspectData);

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

  // Enviar formulario - Simplificado solo para creación
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Asegurarse de no enviar un ID
      const newProspectData = { ...formData };

      // Llamar al callback de creación
      onSubmit(newProspectData);
    } catch (err) {
      console.error('Error al guardar el prospecto:', err);
      setError('Error al guardar los datos');
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <Grid container spacing={3}>
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
              <InputLabel>Cargo del contacto</InputLabel>
              <Select
                name="Cargo del contacto"
                value={formData.cargo_contacto || ''}
                label="Cargo del contacto"
                onChange={handleSelectChange}
                required
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
            />
          </Grid>

          {/* Sección para tipo de acción y fecha de vencimiento */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Tipo de Acción"
              placeholder="Tipo de acción pendiente"
              fullWidth
              value={formData.tipoAccion || ''}
              onChange={(e) => handleChange('tipoAccion', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha de Vencimiento"
              value={stringToDate(formData.fechaVencimiento)}
              onChange={(date) => handleChange('fechaVencimiento', date)}
            />

          </Grid>

          {/* Campos adicionales */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Número de Comitente"
              placeholder="Número de comitente"
              fullWidth
              value={formData.numComitente || ''}
              onChange={(e) => handleChange('numComitente', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.yaEsCliente || false}
                  onChange={(e) => handleChange('yaEsCliente', e.target.checked)}
                />
              }
              label="¿Ya es cliente?"
            />
          </Grid>
        </Grid>

        <div className={styles.formActions}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
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
    </LocalizationProvider>
  );
};

export default ProspectForm;